# Storefront Authentication Guide

This project uses passwordless customer authentication by Turkmen phone number.
The current code is a development-safe simulation: the accepted OTP is `1234`.
It intentionally uses Medusa's customer Auth Identity and cookie-backed session
infrastructure, not a custom storefront token.

## Goals and guarantees

- A phone number maps to one Medusa customer account.
- A customer can log in without a separate registration screen.
- First successful verification creates the customer account automatically.
- Subsequent successful verifications reuse that customer account.
- Medusa's normal authenticated Store API routes, including
  `/store/customers/me` and `/store/orders`, work after login.
- The frontend uses `GET /store/auth/me` as its global authentication source of
  truth.

## Architecture

```text
AuthDialog
  │  Medusa JS SDK (session credentials + publishable API key)
  ▼
Store authentication routes
  │
  ├─ OtpService                 Development implementation accepts 1234
  ├─ PhoneOtpAuthService        Medusa Auth provider, keyed by phone
  ├─ verifyPhoneOtpWorkflow     Finds/creates customer and links identity
  └─ Express session            Stores Medusa auth_context in connect.sid
  ▼
Authenticated Store API routes
  ├─ GET /store/auth/me
  ├─ GET /store/customers/me
  ├─ Customer address APIs
  └─ Order APIs
```

The storefront SDK is configured with `auth: { type: "session" }`. It therefore
sends cookies with requests; it does not store an authentication JWT in local or
session storage for this flow.

## Current phone OTP flow

### 1. Send code

`AuthDialog` accepts eight local digits and prefixes them with `+993` before
calling:

```http
POST /store/auth/otp/send
Content-Type: application/json

{ "phone": "+99365123456" }
```

The request is validated as `+993` followed by exactly eight digits. The current
`OtpService` performs no external delivery and responds:

```json
{ "success": true }
```

### 2. Verify code and resolve the account

The dialog calls:

```http
POST /store/auth/otp/verify
Content-Type: application/json

{ "phone": "+99365123456", "otp": "1234" }
```

The backend performs these operations inside the authentication provider and
workflow:

1. `OtpService.verify` checks the code.
2. `PhoneOtpAuthService` retrieves or creates the Medusa Auth Identity whose
   provider identity is the phone number.
3. The workflow looks up a Medusa customer with the same `phone`.
4. If no customer exists, it creates one with `phone`, empty `first_name` and
   `last_name`, `email: null`, and `has_account: true`.
5. `setAuthAppMetadataStep` associates the Auth Identity with the customer as a
   `customer` actor.
6. The route writes the native Medusa `auth_context` to the Express session and
   explicitly saves it before responding.

An invalid code returns:

```http
401 Unauthorized

{ "success": false, "message": "Invalid OTP" }
```

A successful response includes `success: true` and a customer payload. The
frontend deliberately does not use that payload as its state source; it refreshes
the session through `/store/auth/me` instead.

### 3. Read the logged-in customer

After verification, and when the storefront first loads, `AuthProvider` calls:

```http
GET /store/auth/me
```

Unauthenticated response:

```json
{ "authenticated": false, "customer": null }
```

Authenticated response:

```json
{
  "authenticated": true,
  "customer": {
    "id": "cus_...",
    "phone_number": "+99365123456",
    "email": "",
    "first_name": "",
    "last_name": ""
  }
}
```

This custom response normalizes Medusa nullable customer fields to strings and
renames Medusa's `customer.phone` to `phone_number` for the storefront contract.

### 4. Use normal Medusa customer routes

Once the session exists, the customer is authenticated exactly like a native
Medusa email/password customer. For example:

```ts
const { customer } = await medusa.store.customer.retrieve()
const { orders } = await medusa.store.order.list({ limit: 10 })
```

`/store/auth/me` is for global login state. The built-in customer endpoint is the
right source for a detailed profile or address-book page.

### 5. Logout

```http
POST /store/auth/logout
```

The route destroys the Express session and clears the configured session cookie
(`connect.sid` by default). `AuthProvider` then replaces its cached auth state
with `{ authenticated: false, customer: null }`.

## Auth flow variants

### Anonymous visitor

No session cookie or no valid `auth_context` is present. `AuthProvider` exposes:

```ts
{ customer: null, isAuthenticated: false, isLoading: false }
```

Protected account pages must redirect to login or render an access prompt.

### Existing phone customer

The identity and customer already exist. OTP verification reuses both and opens a
new session. No customer record is duplicated.

### New phone customer

The identity and customer do not exist. A successful OTP verification creates
both, links them, and signs the customer in in one operation.

### Invalid or failed OTP

The session is not changed. The dialog keeps the phone step, clears the OTP input,
and displays the error. Network errors follow the same UI pattern, but should not
be reported as an invalid code.

### Session restoration

On a later browser visit, the SDK includes the existing session cookie in
`GET /store/auth/me`. The provider restores the user without opening the dialog.

### Production SMS provider

Replace only the implementation behind `OtpService`:

- `send(phone)` should ask the provider to send a code.
- `verify(phone, otp)` should validate the provider's code.

The frontend API, `PhoneOtpAuthService`, customer workflow, and session handling
do not need to change.

### Phone-number change

Do **not** call the standard customer update API directly to change the login
phone. The phone is also the `phoneotp` Auth Identity's `entity_id`.

Implement this as a dedicated authenticated workflow:

1. Send and verify an OTP for the new number.
2. Ensure the new number is not linked to another account.
3. Update both `customer.phone` and the provider identity atomically.
4. Refresh or rotate the current session.

Delivery-address phone numbers are separate from the login phone and can be
edited through Medusa's normal address APIs.

### Optional email/password or email verification

The backend still has Medusa's `emailpass` provider enabled. It can support a
separate email/password flow later, but it is not part of the current storefront
experience. Adding or changing a customer email should use a verified custom
flow: Medusa's Store `customer.update` payload intentionally excludes `email`.

## Storefront ownership

| Area                                            | Responsibility                                            |
| ----------------------------------------------- | --------------------------------------------------------- |
| `src/components/layout/AuthDialog.tsx`          | Phone and OTP UI, resend timer, error/loading states.     |
| `src/features/auth/api/client.ts`               | Calls custom Store auth routes through the Medusa JS SDK. |
| `src/features/auth/components/AuthProvider.tsx` | Global auth state, session refresh, login, and logout.    |
| `src/components/layout/Header.tsx`              | Login trigger, authenticated customer display, logout.    |
| `src/lib/medusa.ts`                             | Session-auth SDK configuration.                           |

`AuthProvider` exposes:

```ts
customer
isAuthenticated
isLoading
requestOtp(phone)
login(phone, otp)
logout()
refreshUser()
```

All custom Store API requests must use `medusa.client.fetch` with plain object
bodies. The SDK supplies the publishable API key, serializes JSON, and includes
the session cookie.

## Backend ownership

| Area                       | Responsibility                                                                |
| -------------------------- | ----------------------------------------------------------------------------- |
| `src/services/otp.ts`      | Isolated OTP interface and temporary `1234` implementation.                   |
| `src/providers/phone-otp/` | Medusa Auth provider for the `phoneotp` identity.                             |
| `src/workflows/auth/`      | OTP send plus identity/customer resolve-or-create workflow.                   |
| `src/api/store/auth/`      | HTTP routes for send, verify, current user, and logout.                       |
| `src/api/middlewares.ts`   | Zod body validation and optional session authentication for `/store/auth/me`. |

No migration is required: the implementation uses Medusa's existing Auth and
Customer data models.

## API contracts package

`packages/api-contracts` is the monorepo's shared, type-only boundary for API
shapes that are owned by this project. It already contains vendor contracts and
now exports the storefront authentication contracts from
`src/storefront-auth.ts`.

It prevents the storefront and backend from independently inventing different
request and response shapes. It adds no browser runtime code; import the types
with `import type`.

| Type                                    | Purpose                                                   |
| --------------------------------------- | --------------------------------------------------------- |
| `AuthCustomer`                          | Normalized customer summary returned by `/store/auth/me`. |
| `AuthMeResponse`                        | Discriminated authenticated/guest response union.         |
| `SendOtpRequest`, `SendOtpResponse`     | `POST /store/auth/otp/send` contract.                     |
| `VerifyOtpRequest`, `VerifyOtpResponse` | Verify request and success acknowledgement.               |
| `AuthErrorResponse`                     | Invalid-code or other user-safe auth error.               |
| `LogoutResponse`                        | Logout success acknowledgement.                           |

`VerifyOtpResponse` intentionally guarantees only `{ success: true }`, even
though the server also returns a customer object today. This prevents UI code from
coupling to a transient login response and keeps `/store/auth/me` as the single
source of truth for global customer state.

The package is a TypeScript contract, not runtime validation. The backend remains
responsible for Zod validation in `src/api/store/auth/otp/middlewares.ts`.

## Profile-page data available after login

Use `medusa.store.customer.retrieve()` for the complete customer profile. Useful
fields include:

- `first_name`, `last_name`, `company_name`, `phone`, and `email`.
- `addresses`, `default_shipping_address_id`, and
  `default_billing_address_id`.
- `created_at` for a member-since label.
- Scoped `metadata` only for deliberate custom fields; do not use it as an
  unstructured client-side preferences bucket.

Use the standard SDK methods for the address book:

```ts
medusa.store.customer.listAddress()
medusa.store.customer.createAddress(data)
medusa.store.customer.updateAddress(addressId, data)
medusa.store.customer.deleteAddress(addressId)
```

Order history uses `medusa.store.order.list()` and order details use
`medusa.store.order.retrieve(id)`. Orders provide display ID, creation time,
currency, totals, item lines, shipping/billing addresses, payment status,
fulfillment status, shipping methods, and fulfillment records.

Saved payment methods, wishlists, loyalty, reviews, avatars, marketing
preferences, returns, and exchanges need their own supported backend module or
custom Store API before they should appear as account features.

## Production readiness checklist

- Remove the hardcoded `1234` code.
- Keep SMS-provider credentials server-only.
- Add OTP expiry, single-use state, retry/attempt limits, resend throttling, and
  phone/IP rate limiting.
- Avoid logging phone numbers, OTP values, cookies, or tokens.
- Normalize phone input consistently and decide how recycled numbers are handled.
- Enforce HTTPS and verify CORS plus cookie behavior across storefront and API
  domains.
- Add integration tests for new account creation, repeat login, invalid/expired
  code, `/store/customers/me`, session restoration, logout, and phone change.
- Add a verified email flow before making email editable.
