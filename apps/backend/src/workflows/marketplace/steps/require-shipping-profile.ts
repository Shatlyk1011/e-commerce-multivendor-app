import { MedusaError } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type Input = { shipping_profiles?: Array<{ id?: string | null } | null> };

const requireShippingProfileStep = createStep(
  "require-shipping-profile",
  async ({ shipping_profiles }: Input) => {
    const shippingProfileId = shipping_profiles?.[0]?.id;
    if (!shippingProfileId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No default shipping profile is configured.",
      );
    }
    return new StepResponse(shippingProfileId);
  },
);

export default requireShippingProfileStep;
