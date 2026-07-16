# Storefront Phone Auth

## Current Flow

1. `AuthDialog` collects an 8-digit Turkmen phone number.
2. The UI currently treats the SMS as sent locally; no SMS provider is called.
3. The customer enters an OTP. The temporary accepted code is `1234`.
4. The browser sends `{ phone, otp }` to the same-origin `POST /api/auth/phone` route.
5. The route calls Medusa's standard `phonepass` auth endpoint.
6. The native Medusa provider verifies the OTP and finds the phone-keyed auth identity.
7. For a new phone, the route registers the identity, uses the actorless token to call Medusa's standard customer-create flow, then logs in again for an actor-bound token.
8. The route stores the Medusa JWT in an HttpOnly `storefront_auth` cookie.
9. Storefront SDK requests use the same-origin `/medusa/*` rewrite. Middleware reads the HttpOnly cookie and adds the bearer header before forwarding to Medusa.
10. `AuthProvider` uses React Query to call `medusa.store.customer.retrieve()` on startup and exposes the current customer globally.

## Before Production

- Replace `verifyOtp()` with the real SMS/OTP provider integration.
- Remove the hardcoded `1234` fallback entirely.
- Configure the real OTP provider in `PhonePassAuthService` and keep its credentials server-only.
- Do not log phone numbers, derived passwords, OTPs, or auth tokens.
- Add OTP expiry, one-time-use tracking, resend throttling, attempt limits, and IP/phone rate limiting.
- Normalize and validate phone numbers consistently, including country-code handling.
- Decide how account recovery, phone-number changes, and duplicate/ recycled numbers should work.
- Use HTTPS in production and verify cookie/token behavior across storefront and backend domains.
- Add monitoring and tests for registration, repeat login, invalid/expired OTP, rate limits, and Medusa failures.
- Review Medusa auth/session/token storage and invalidate existing sessions on account security events.
