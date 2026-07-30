import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
} from "@medusajs/framework/utils";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

interface CategoryNode {
  name: string;
  handle: string;
  fullPath: string;
}

const seenHandles = new Set<string>();

function generateUniqueHandle(
  name: string,
  parentPath?: string | null,
): string {
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

export default async function cleanupDbTaxonomy({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(
    ModuleRegistrationName.PRODUCT,
  );

  let filePath = path.resolve(process.cwd(), "../../google-taxonomy-en.md");
  if (!fs.existsSync(filePath)) {
    filePath = path.resolve(process.cwd(), "google-taxonomy-en.md");
  }

  if (!fs.existsSync(filePath)) {
    logger.error(
      `Cleaned taxonomy file not found. Tried checking path: ${filePath}`,
    );
    return;
  }

  logger.info(`Loading clean taxonomy from: ${filePath}`);

  // Generate valid handles from the cleaned file
  const validHandles = new Set<string>();
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

      const handle = generateUniqueHandle(levelName, parentPath);
      validHandles.add(handle);
    }
  }

  logger.info(
    `Generated ${validHandles.size} valid handles from taxonomy file.`,
  );

  // Load all categories from database
  const dbCategories = await productModuleService.listProductCategories(
    {},
    { select: ["id", "handle", "name", "parent_category_id"] as any },
  );

  logger.info(`Found ${dbCategories.length} categories in database.`);

  const catMap = new Map<string, (typeof dbCategories)[0]>();
  for (const cat of dbCategories) {
    catMap.set(cat.id, cat);
  }

  const depthCache = new Map<string, number>();
  function getDepth(catId: string): number {
    if (depthCache.has(catId)) return depthCache.get(catId)!;
    const cat = catMap.get(catId);
    if (!cat || !cat.parent_category_id) {
      depthCache.set(catId, 0);
      return 0;
    }
    const depth = 1 + getDepth(cat.parent_category_id);
    depthCache.set(catId, depth);
    return depth;
  }

  const toDelete: Array<{
    id: string;
    name: string;
    handle: string;
    depth: number;
  }> = [];
  for (const cat of dbCategories) {
    if (!validHandles.has(cat.handle)) {
      toDelete.push({
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
        depth: getDepth(cat.id),
      });
    }
  }

  if (toDelete.length === 0) {
    logger.info(
      "No invalid categories found in the database. Cleanup complete.",
    );
    return;
  }

  // Sort by depth descending (deepest children first)
  toDelete.sort((a, b) => b.depth - a.depth);

  logger.info(
    `Deleting ${toDelete.length} invalid categories from database sequentially (deepest first)...`,
  );

  let count = 0;
  for (const cat of toDelete) {
    try {
      await productModuleService.deleteProductCategories([cat.id]);
      count++;
      if (count % 100 === 0) {
        logger.info(`Deleted ${count}/${toDelete.length} categories...`);
      }
    } catch (err: any) {
      logger.error(
        `Failed to delete category ${cat.name} (${cat.id}): ${err.message}`,
      );
    }
  }

  logger.info(
    `Successfully deleted ${count} invalid categories from database!`,
  );
}
