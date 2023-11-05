export function getAwsInfraHeader(): { 'x-api-key': string } | {} {
  // AWS_API_GATEWAY_KEY header is needed only for local development so we don't need to use VPN
  const isLocal = process.env.NODE_ENV === 'development'
  const key = process.env.AWS_API_GATEWAY_KEY
  if (isLocal) {
    if (!key) {
      throw new Error('Missing env AWS_API_GATEWAY_KEY')
    }
    return {
      'x-api-key': `${key}`,
    }
  } else if (key) {
    // guard to make sure AWS_API_GATEWAY_KEY to not leak to production
    throw new Error('AWS_API_GATEWAY_KEY is leaking to production, pleasse remove it!')
  }

  return {}
}
