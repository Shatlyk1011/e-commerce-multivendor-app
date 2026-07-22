import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

const turkmenPhoneSchema = z
  .string()
  .regex(/^\+993\d{8}$/, "Phone must use the +993XXXXXXXX format")

export const SendOtpSchema = z.object({
  phone: turkmenPhoneSchema,
})

export type SendOtpSchema = z.infer<typeof SendOtpSchema>

export const VerifyOtpSchema = z.object({
  phone: turkmenPhoneSchema,
  otp: z.string().regex(/^\d{4}$/, "OTP must contain exactly 4 digits"),
})

export type VerifyOtpSchema = z.infer<typeof VerifyOtpSchema>

export const otpMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/auth/otp/send",
    method: "POST",
    middlewares: [validateAndTransformBody(SendOtpSchema)],
  },
  {
    matcher: "/store/auth/otp/verify",
    method: "POST",
    middlewares: [validateAndTransformBody(VerifyOtpSchema)],
  },
]
