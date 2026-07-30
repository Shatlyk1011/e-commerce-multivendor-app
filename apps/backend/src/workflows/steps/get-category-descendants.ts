import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ModuleRegistrationName } from "@medusajs/framework/utils";

async function getDescendantIds(
  parentId: string,
  productModuleService: any,
): Promise<string[]> {
  const children = await productModuleService.listProductCategories(
    { parent_category_id: parentId },
    { select: ["id"] },
  );

  let ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    const subIds = await getDescendantIds(child.id, productModuleService);
    ids = ids.concat(subIds);
  }
  return ids;
}

export const getCategoryDescendantsStep = createStep(
  "get-category-descendants",
  async (targetId: string, { container }) => {
    const productModuleService = container.resolve(
      ModuleRegistrationName.PRODUCT,
    );
    const descendantIds = await getDescendantIds(
      targetId,
      productModuleService,
    );

    // Reverse pre-order list to ensure children are deleted before their parents
    const deleteOrder = [...descendantIds].reverse();
    deleteOrder.push(targetId); // Target category goes last

    return new StepResponse(deleteOrder);
  },
);
