export type AuthCustomer = {
  id: string
  phone_number: string
  email: string
  first_name: string
  last_name: string
}

export type AuthMeResponse =
  | {
      authenticated: true
      customer: AuthCustomer
    }
  | {
      authenticated: false
      customer: null
    }

export type SendOtpRequest = {
  phone: string
}

export type SendOtpResponse = {
  success: true
}

export type VerifyOtpRequest = {
  phone: string
  otp: string
}

export type VerifyOtpResponse = {
  success: true
}

export type AuthErrorResponse = {
  success: false
  message: string
}

export type LogoutResponse = {
  success: true
}
