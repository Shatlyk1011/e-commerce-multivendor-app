import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules, MedusaError } from "@medusajs/framework/utils";

export type CreateAuthIdentityStepInput = {
  email: string;
  password?: string;
};

export const createAuthIdentityStep = createStep(
  "create-auth-identity",
  async (input: CreateAuthIdentityStepInput, { container }) => {
    const authService = container.resolve(Modules.AUTH);

    // Check if auth identity already exists for this email
    const [existing] = await authService.listAuthIdentities({
      provider_identities: {
        entity_id: input.email,
        provider: "emailpass",
      },
    });

    if (existing) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Auth identity with email ${input.email} already exists`,
      );
    }

    // Register the emailpass credentials
    const authResponse = await authService.register("emailpass", {
      body: {
        email: input.email,
        password: input.password || "",
      },
    });

    if (!authResponse.success || !authResponse.authIdentity) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        authResponse.error || "Failed to create auth identity",
      );
    }

    return new StepResponse(
      authResponse.authIdentity,
      authResponse.authIdentity.id,
    );
  },
  async (authIdentityId, { container }) => {
    if (authIdentityId) {
      const authService = container.resolve(Modules.AUTH);
      await authService.deleteAuthIdentities([authIdentityId]);
    }
  },
);
