import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const response = NextResponse.next()

  if (allowedOrigins.includes(request.headers.get('origin') || '')) {
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '')
  }
  return response
}
