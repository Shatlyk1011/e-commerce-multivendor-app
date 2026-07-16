import { NextRequest, NextResponse } from 'next/server'

import Medusa from '@medusajs/js-sdk'
import { createHmac } from 'node:crypto'

const OTP_CODE = '1234'
const PHONE_PATTERN = /^\d{8}$/

// Replace this stub with the SMS provider integration when OTP delivery is available.
async function verifyOtp(phone: string, otp: string) {
  void phone
  return otp === OTP_CODE
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '').replace(/^993/, '').slice(-8)
}

function credentialsForPhone(phone: string) {
  const secret = process.env.PHONE_AUTH_SECRET
  if (!secret) throw new Error('PHONE_AUTH_SECRET is not configured')

  const normalizedPhone = normalizePhone(phone)
  const email = `${normalizedPhone}@phone.local`
  const password = `phone_${createHmac('sha256', secret).update(normalizedPhone).digest('hex')}`

  return { normalizedPhone, email, password }
}

function isMissingIdentity(error: unknown) {
  const candidate = error as { status?: number; message?: string }
  return candidate.status === 401 || /not found|invalid credential|does not exist/i.test(candidate.message || '')
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone?: string; otp?: string }
    const phone = normalizePhone(body.phone || '')

    if (!PHONE_PATTERN.test(phone)) {
      return NextResponse.json({ message: 'Введите корректный номер телефона.' }, { status: 400 })
    }

    if (!(await verifyOtp(phone, body.otp || ''))) {
      return NextResponse.json({ message: 'Неверный код подтверждения.' }, { status: 401 })
    }

    const { email, password, normalizedPhone } = credentialsForPhone(phone)
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const medusa = new Medusa({
      baseUrl: backendUrl,
      publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      auth: { type: 'session' },
    })

    let token: string | undefined

    try {
      const result = await medusa.auth.login('customer', 'emailpass', { email, password })
      token = typeof result === 'string' ? result : undefined
    } catch (error) {
      if (!isMissingIdentity(error)) throw error

      await medusa.auth.register('customer', 'emailpass', { email, password })
      const result = await medusa.auth.login('customer', 'emailpass', { email, password })
      token = typeof result === 'string' ? result : undefined
    }

    if (!token) {
      return NextResponse.json({ message: 'Не удалось завершить авторизацию.' }, { status: 502 })
    }

    await medusa.client.setToken(token)
    try {
      await medusa.store.customer.retrieve()
    } catch {
      await medusa.store.customer.create({
        email,
        phone: `+993${normalizedPhone}`,
        first_name: 'Покупатель',
      })
    }

    return NextResponse.json({ token, phone: `+993${normalizedPhone}` })
  } catch (error) {
    console.error('Phone authentication failed:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Ошибка авторизации.' },
      { status: 500 },
    )
  }
}
