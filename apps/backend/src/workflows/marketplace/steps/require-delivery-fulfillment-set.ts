import { MedusaError } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type Input = {
  fulfillment_sets?: Array<{ id?: string | null } | null>;
};

const requireDeliveryFulfillmentSetStep = createStep(
  "require-delivery-fulfillment-set",
  async ({ fulfillment_sets }: Input) => {
    const fulfillmentSetId = fulfillment_sets?.[0]?.id;
    if (!fulfillmentSetId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No fulfillment set is configured for marketplace delivery.",
      );
    }

    return new StepResponse(fulfillmentSetId);
  },
);

export default requireDeliveryFulfillmentSetStep;
