import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const response = NextResponse.next()
  const origin = request.headers.get('origin') || ''

  // If the origin is in the ALLOWED_ORIGINS env, add it to the Access-Control-Allow-Origin header
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  return response
}
