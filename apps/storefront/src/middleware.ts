import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('storefront_auth')?.value
  if (!token) return NextResponse.next()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('authorization', `Bearer ${token}`)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/medusa/:path*'],
}
