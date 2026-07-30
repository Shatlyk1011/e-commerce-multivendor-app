import type {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityProviderService,
} from "@medusajs/framework/types";
import {
  AbstractAuthModuleProvider,
  MedusaError,
} from "@medusajs/framework/utils";

import { otpService } from "../../services/otp";

export const PHONE_OTP_PROVIDER = "phoneotp";

class PhoneOtpAuthService extends AbstractAuthModuleProvider {
  static identifier = PHONE_OTP_PROVIDER;
  static DISPLAY_NAME = "Phone OTP";

  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService,
  ): Promise<AuthenticationResponse> {
    const phone = data.body?.phone;
    const otp = data.body?.otp;

    if (!phone || !otp || !(await otpService.verify(phone, otp))) {
      return {
        success: false,
        error: "Invalid OTP",
      };
    }

    try {
      const authIdentity = await authIdentityProviderService.retrieve({
        entity_id: phone,
      });

      return {
        success: true,
        authIdentity,
      };
    } catch (error) {
      if (
        !(error instanceof MedusaError) ||
        error.type !== MedusaError.Types.NOT_FOUND
      ) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Authentication failed",
        };
      }
    }

    const authIdentity = await authIdentityProviderService.create({
      entity_id: phone,
      user_metadata: { phone },
    });

    return {
      success: true,
      authIdentity,
    };
  }
}

export default PhoneOtpAuthService;
