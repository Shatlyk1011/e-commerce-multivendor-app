import { NextRequest, NextResponse } from 'next/server'

import Medusa from '@medusajs/js-sdk'

const PHONE_PATTERN = /^\d{8}$/

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '').replace(/^993/, '').slice(-8)
}

function isAlreadyRegistered(error: unknown) {
  const candidate = error as { status?: number; message?: string }
  return /already registered|already exists|already linked/i.test(candidate.message || '')
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone?: string; otp?: string }
    const phone = normalizePhone(body.phone || '')

    if (!PHONE_PATTERN.test(phone)) {
      return NextResponse.json({ message: 'Введите корректный номер телефона.' }, { status: 400 })
    }

    const normalizedPhone = phone
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const medusa = new Medusa({
      baseUrl: backendUrl,
      publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      auth: { type: 'jwt' },
    })

    let token: string | undefined

    try {
      const registration = await medusa.auth.register('customer', 'phonepass', {
        phone: `+993${normalizedPhone}`,
        otp: body.otp,
      })
      if (typeof registration !== 'string') throw new Error('Phone registration requires additional steps')

      await medusa.client.setToken(registration)
      await medusa.store.customer.create({
        phone: `+993${normalizedPhone}`,
        first_name: 'Покупатель',
      })

      const result = await medusa.auth.login('customer', 'phonepass', {
        phone: `+993${normalizedPhone}`,
        otp: body.otp,
      })
      token = typeof result === 'string' ? result : undefined
    } catch (error) {
      if (!isAlreadyRegistered(error)) throw error

      const result = await medusa.auth.login('customer', 'phonepass', {
        phone: `+993${normalizedPhone}`,
        otp: body.otp,
      })
      token = typeof result === 'string' ? result : undefined
    }

    if (!token) {
      return NextResponse.json({ message: 'Не удалось завершить авторизацию.' }, { status: 502 })
    }

    const response = NextResponse.json({ phone: `+993${normalizedPhone}` })
    response.cookies.set('storefront_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    return response
  } catch (error) {
    console.error('Phone authentication failed:', error)
    const candidate = error as { status?: number; statusText?: string; message?: string }
    return NextResponse.json(
      {
        message: candidate.message || 'Ошибка авторизации.',
        ...(process.env.NODE_ENV !== 'production'
          ? { upstream_status: candidate.status, upstream_status_text: candidate.statusText }
          : {}),
      },
      { status: candidate.status && candidate.status >= 400 && candidate.status < 600 ? candidate.status : 500 },
    )
  }
}
