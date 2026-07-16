import { MedusaContainer } from "@medusajs/framework";
import { cascadeDeleteCategoryWorkflow } from "../workflows/cascade-delete-category";

export default async function runCascadeDelete({ container }: { container: MedusaContainer }) {
  const logger = container.resolve("logger");
  const targetId = "pcat_01KXNP7XMHBT45RAJEK9NMVVYF";

  logger.info(`Starting cascade delete for category: ${targetId}...`);

  try {
    const { result } = await cascadeDeleteCategoryWorkflow(container).run({
      input: { id: targetId },
    });

    logger.info(`Successfully deleted target category and descendants!`);
    logger.info(`Total categories deleted: ${result.deleted_ids.length}`);
    logger.info(`Deleted IDs: ${JSON.stringify(result.deleted_ids)}`);
  } catch (error) {
    logger.error(`Failed to cascade delete category: ${error.message}`);
    throw error;
  }
}
