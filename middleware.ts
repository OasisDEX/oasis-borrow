import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { handleRewrite } from 'server/rewrites'

function getRandomishId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function middleware(request: NextRequest) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

  const possibleRewrite = handleRewrite(request)

  if (possibleRewrite) {
    return possibleRewrite
  }

  const response = NextResponse.next()
  const origin = request.headers.get('origin') || ''
  const userAgentHeader = request.headers.get('user-agent') || ''
  request.headers.set('user-agent', `${userAgentHeader} Summer.fi/${getRandomishId()}`)

  // If the origin is in the ALLOWED_ORIGINS env, add it to the Access-Control-Allow-Origin header
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  // Get `CloudFront-Viewer-Country` header if exists from request and set cookie
  const country = request.headers.get('CloudFront-Viewer-Country')
  if (country) {
    response.cookies.set('country', country)
  }

  return response
}
