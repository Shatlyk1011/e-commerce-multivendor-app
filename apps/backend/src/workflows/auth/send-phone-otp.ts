import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { sendPhoneOtpStep } from "./steps/send-phone-otp";

export type SendPhoneOtpWorkflowInput = {
  phone: string;
};

export const sendPhoneOtpWorkflow = createWorkflow(
  "send-phone-otp",
  function (input: SendPhoneOtpWorkflowInput) {
    const result = sendPhoneOtpStep(input.phone);

    return new WorkflowResponse(result);
  },
);
