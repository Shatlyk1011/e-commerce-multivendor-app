import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, ModuleRegistrationName } from "@medusajs/framework/utils";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

interface CategoryNode {
  name: string;
  handle: string;
  fullPath: string;
  parentPath: string | null;
  depth: number;
}

const seenHandles = new Set<string>();

function generateUniqueHandle(name: string, parentPath?: string | null): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let handle = base;
  if (parentPath) {
    const parentBase = parentPath
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    handle = `${parentBase}-${base}`;
  }

  // Slice at 200 to stay safely below Medusa/DB limits
  if (handle.length > 200) {
    handle = handle.slice(0, 200);
  }

  let counter = 1;
  let uniqueHandle = handle;
  while (seenHandles.has(uniqueHandle)) {
    const suffix = `-${counter}`;
    uniqueHandle = `${handle.slice(0, 200 - suffix.length)}${suffix}`;
    counter++;
  }

  seenHandles.add(uniqueHandle);
  return uniqueHandle;
}

export default async function importTaxonomy({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT);

  // Try finding file in workspace root or current directory
  let filePath = path.resolve(process.cwd(), "../../google-taxonomy-en.md");
  if (!fs.existsSync(filePath)) {
    filePath = path.resolve(process.cwd(), "google-taxonomy-en.md");
  }

  if (!fs.existsSync(filePath)) {
    logger.error(`Taxonomy file not found. Tried checking path: ${filePath}`);
    return;
  }

  logger.info(`Found taxonomy file at: ${filePath}`);

  // 1. Fetch all existing categories to make the script idempotent and resumeable
  logger.info("Loading existing product categories from database...");
  const existingCategories = await productModuleService.listProductCategories(
    {},
    { select: ["id", "handle"] }
  );

  const existingHandleMap = new Map<string, string>();
  for (const cat of existingCategories) {
    existingHandleMap.set(cat.handle, cat.id);
    seenHandles.add(cat.handle);
  }
  logger.info(`Loaded ${existingCategories.length} existing categories.`);

  logger.info("Parsing Google Taxonomy file...");

  const depthGroups = new Map<number, CategoryNode[]>();
  const seenPaths = new Set<string>();

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const levels = trimmedLine.split(" > ").map((l) => l.trim());
    let currentPath = "";

    for (let i = 0; i < levels.length; i++) {
      const levelName = levels[i];
      const parentPath = currentPath || null;
      currentPath = currentPath ? `${currentPath} > ${levelName}` : levelName;

      if (seenPaths.has(currentPath)) {
        continue;
      }
      seenPaths.add(currentPath);

      const depth = i;
      const node: CategoryNode = {
        name: levelName,
        handle: generateUniqueHandle(levelName, parentPath),
        fullPath: currentPath,
        parentPath: parentPath,
        depth: depth,
      };

      if (!depthGroups.has(depth)) {
        depthGroups.set(depth, []);
      }
      depthGroups.get(depth)!.push(node);
    }
  }

  const maxDepth = Math.max(...Array.from(depthGroups.keys()));
  logger.info(`Found ${seenPaths.size} unique categories in the file across ${maxDepth + 1} depth levels.`);

  const pathIdMap = new Map<string, string>();
  let totalCreated = 0;
  let totalSkipped = 0;

  // Insert level-by-level to ensure parents always exist before children
  for (let depth = 0; depth <= maxDepth; depth++) {
    const nodes = depthGroups.get(depth) || [];
    if (nodes.length === 0) continue;

    logger.info(`Processing depth level ${depth} (${nodes.length} categories)...`);

    const toCreateNodes: CategoryNode[] = [];

    for (const node of nodes) {
      // Check if the handle already exists in database
      if (existingHandleMap.has(node.handle)) {
        const id = existingHandleMap.get(node.handle)!;
        pathIdMap.set(node.fullPath, id);
        totalSkipped++;
      } else {
        toCreateNodes.push(node);
      }
    }

    if (toCreateNodes.length === 0) {
      logger.info(`All categories at depth level ${depth} already exist. Skipped.`);
      continue;
    }

    // Prepare input list for batch insert
    const inputs = toCreateNodes.map((node) => {
      const parentId = node.parentPath ? pathIdMap.get(node.parentPath) : null;
      return {
        name: node.name,
        handle: node.handle,
        parent_category_id: parentId,
        is_active: true,
      };
    });

    logger.info(`Inserting ${inputs.length} new categories at depth level ${depth}...`);

    // Bulk insert in batches of 100 to avoid DB query parameter limits
    const batchSize = 100;
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const created = await productModuleService.createProductCategories(batch);
      
      for (const cat of created) {
        // Map fullPath -> database ID
        const match = toCreateNodes.find((n) => n.handle === cat.handle);
        if (match) {
          pathIdMap.set(match.fullPath, cat.id);
        }
      }
      totalCreated += created.length;
    }
  }

  logger.info(`Import complete! Created: ${totalCreated}, Skipped: ${totalSkipped}`);
}
