import {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityProviderService,
  Logger,
} from "@medusajs/framework/types"
import { AbstractAuthModuleProvider, MedusaError } from "@medusajs/framework/utils"
import type { PhonePassAuthInput } from "@dtc/api-contracts"

type PhonePassOptions = {
  developmentOtp?: string
}

function normalizePhone(value: unknown) {
  return String(value || "").replace(/\D/g, "").replace(/^993/, "").slice(-8)
}

function isNotFoundError(error: unknown) {
  const candidate = error as { type?: string; message?: string }
  return candidate?.type === MedusaError.Types.NOT_FOUND || /not found/i.test(candidate?.message || "")
}

export class PhonePassAuthService extends AbstractAuthModuleProvider {
  static identifier = "phonepass"
  static DISPLAY_NAME = "Phone and OTP"
  protected options_: PhonePassOptions
  protected logger_: Logger

  constructor({ logger }: { logger: Logger }, options: PhonePassOptions = {}) {
    // @ts-ignore Medusa's abstract provider constructor is intentionally untyped.
    super(...arguments)
    this.options_ = options
    this.logger_ = logger
  }

  private async verifyOtp(phone: string, otp: unknown) {
    // Replace with the external OTP service before production.
    const valid = otp === (this.options_.developmentOtp || "1234") && phone.length === 8
    if (!valid) this.logger_?.warn?.(`phonepass OTP rejected for normalized phone ${phone}`)
    return valid
  }

  async authenticate(
    input: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const body = input.body as PhonePassAuthInput
    const phone = normalizePhone(body?.phone)
    this.logger_.info?.(`phonepass authenticate called for ${phone}`)

    if (!(await this.verifyOtp(phone, body?.otp))) {
      return { success: false, error: "Invalid phone or OTP" }
    }

    try {
      const authIdentity = await authIdentityService.retrieve({ entity_id: phone })
      return { success: true, authIdentity }
    } catch (error) {
      if (isNotFoundError(error)) {
        return { success: false, error: "Phone number is not registered" }
      }
      return { success: false, error: "Unable to retrieve phone identity" }
    }
  }

  async register(
    input: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const body = input.body as PhonePassAuthInput
    const phone = normalizePhone(body?.phone)
    this.logger_.info?.(`phonepass register called for ${phone}`)

    if (!(await this.verifyOtp(phone, body?.otp))) {
      return { success: false, error: "Invalid phone or OTP" }
    }

    try {
      const existing = await authIdentityService.retrieve({ entity_id: phone })
      if (existing.app_metadata && Object.keys(existing.app_metadata).length > 0) {
        return { success: false, error: "Phone number is already registered" }
      }
      return { success: true, authIdentity: existing }
    } catch (error) {
      if (!isNotFoundError(error)) {
        return { success: false, error: "Unable to retrieve phone identity" }
      }
    }

    const authIdentity = await authIdentityService.create({
      entity_id: phone,
      provider_metadata: { phone },
    })

    return { success: true, authIdentity }
  }
}
