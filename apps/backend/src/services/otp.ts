export interface OtpService {
  send(phone: string): Promise<void>
  verify(phone: string, otp: string): Promise<boolean>
}

class DevelopmentOtpService implements OtpService {
  async send(_phone: string): Promise<void> {
    // TODO: Ask the real OTP provider to send a code here. The public API
    // contract intentionally doesn't expose provider-specific details.
  }

  async verify(_phone: string, otp: string): Promise<boolean> {
    // TODO: Replace this development-only check with the real OTP provider.
    return otp === "1234"
  }
}

export const otpService: OtpService = new DevelopmentOtpService()
