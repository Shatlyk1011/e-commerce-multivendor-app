import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import Medusa from '@medusajs/js-sdk'

export async function GET() {
  const token = (await cookies()).get('storefront_auth')?.value
  console.log('token', token)
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const medusa = new Medusa({
    baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
    auth: { type: 'jwt' },
  })

  try {
    await medusa.client.setToken(token)
    const { customer } = await medusa.store.customer.retrieve()
    return NextResponse.json({ customer })
  } catch (error) {
    const candidate = error as { status?: number }
    return NextResponse.json({ message: 'Unauthorized' }, { status: candidate.status === 401 ? 401 : 502 })
  }
}
