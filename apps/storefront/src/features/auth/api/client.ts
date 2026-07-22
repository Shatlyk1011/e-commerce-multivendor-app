import type {
  AuthMeResponse,
  LogoutResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@dtc/api-contracts'

import { medusa } from '@/lib/medusa'

export function getCurrentUser() {
  return medusa.client.fetch<AuthMeResponse>('/store/auth/me')
}

export function sendOtp(body: SendOtpRequest) {
  return medusa.client.fetch<SendOtpResponse>('/store/auth/otp/send', {
    method: 'POST',
    body,
  })
}

export function verifyOtp(body: VerifyOtpRequest) {
  return medusa.client.fetch<VerifyOtpResponse>('/store/auth/otp/verify', {
    method: 'POST',
    body,
  })
}

export function logoutCustomer() {
  return medusa.client.fetch<LogoutResponse>('/store/auth/logout', {
    method: 'POST',
  })
}
