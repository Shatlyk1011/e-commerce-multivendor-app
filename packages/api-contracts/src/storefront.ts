/** Public contracts for the storefront's authentication boundary. */

/** Payload accepted by the backend PhonePass authentication provider. */
export type PhonePassAuthInput = {
  phone?: string
  otp?: string
}

/** Payload accepted by the storefront's `POST /api/auth/phone` route. */
export type StorefrontPhoneAuthRequest = {
  /** Eight-digit Turkmen national phone number, without the +993 prefix. */
  phone: string
  otp: string
}

export type StorefrontPhoneAuthResponse = {
  phone: string
}

export type StorefrontAuthErrorResponse = {
  message: string
  upstream_status?: number
  upstream_status_text?: string
}
