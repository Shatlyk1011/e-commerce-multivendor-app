import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows";

import { authenticatePhoneOtpStep } from "./steps/authenticate-phone-otp";
import { findOrCreatePhoneCustomerStep } from "./steps/find-or-create-phone-customer";

export type VerifyPhoneOtpWorkflowInput = {
  phone: string;
  otp: string;
};

export const verifyPhoneOtpWorkflow = createWorkflow(
  "verify-phone-otp",
  function (input: VerifyPhoneOtpWorkflowInput) {
    const authentication = authenticatePhoneOtpStep(input);
    const customer = findOrCreatePhoneCustomerStep(input.phone);

    const authMetadataInput = transform(
      { authentication, customer },
      (data) => ({
        authIdentityId: data.authentication.authIdentity.id,
        actorType: "customer",
        value: data.customer.id,
      }),
    );

    // Medusa's setAuthAppMetadataStep is intentionally one-time: it throws if
    // the actor key already exists. Repeat phone logins reuse the existing
    // identity, so only attach metadata for a newly/unlinked identity.
    when(
      { authentication },
      (data) => !data.authentication.authIdentity.app_metadata?.customer_id,
    ).then(() => {
      setAuthAppMetadataStep(authMetadataInput);
    });

    return new WorkflowResponse({
      authIdentity: authentication.authIdentity,
      customer,
    });
  },
);
