import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, ModuleRegistrationName } from "@medusajs/framework/utils";

export default async function verifyCategories({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT);

  logger.info("Fetching categories count...");
  const [categories, count] = await productModuleService.listAndCountProductCategories(
    {},
    { select: ["id", "name", "handle", "parent_category_id"] }
  );

  logger.info(`Total product categories in database: ${count}`);

  // Fetch some sample categories that have parents and children
  const sampleWithParent = categories.find((c) => c.parent_category_id !== null);
  if (sampleWithParent) {
    const parent = categories.find((c) => c.id === sampleWithParent.parent_category_id);
    logger.info(`Sample hierarchy verify:`);
    logger.info(`- Subcategory: "${sampleWithParent.name}" (handle: ${sampleWithParent.handle})`);
    logger.info(`- Parent: "${parent?.name}" (handle: ${parent?.handle})`);
  }

  // Count root categories (no parent)
  const rootsCount = categories.filter((c) => c.parent_category_id === null).length;
  logger.info(`Total root categories: ${rootsCount}`);
}
