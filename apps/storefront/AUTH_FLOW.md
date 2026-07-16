# Storefront Phone Auth

## Current Flow

1. `AuthDialog` collects an 8-digit Turkmen phone number.
2. The UI currently treats the SMS as sent locally; no SMS provider is called.
3. The customer enters an OTP. The temporary accepted code is `1234`.
4. The browser sends `{ phone, otp }` to the same-origin `POST /api/auth/phone` route.
5. The Next.js route normalizes the phone and verifies the OTP through `verifyOtp()`.
6. The route derives a synthetic Medusa email (`<phone>@phone.local`) and an HMAC-SHA256 password using the server-only `PHONE_AUTH_SECRET`.
7. It logs the customer in with Medusa `emailpass`; if the identity does not exist, it registers it first.
8. It creates the Medusa customer profile when needed, then returns the Medusa token.
9. The browser passes the token to `medusa.client.setToken()` for subsequent storefront requests.

## Before Production

- Replace `verifyOtp()` with the real SMS/OTP provider integration.
- Remove the hardcoded `1234` fallback entirely.
- Generate a strong random `PHONE_AUTH_SECRET`; store it only in the server environment, never in `NEXT_PUBLIC_*` variables.
- Do not log phone numbers, derived passwords, OTPs, or auth tokens.
- Add OTP expiry, one-time-use tracking, resend throttling, attempt limits, and IP/phone rate limiting.
- Normalize and validate phone numbers consistently, including country-code handling.
- Decide how account recovery, phone-number changes, and duplicate/ recycled numbers should work.
- Use HTTPS in production and verify cookie/token behavior across storefront and backend domains.
- Add monitoring and tests for registration, repeat login, invalid/expired OTP, rate limits, and Medusa failures.
- Review Medusa auth/session/token storage and invalidate existing sessions on account security events.
