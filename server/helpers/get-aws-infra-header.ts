export function getAwsInfraHeader(): { 'x-api-key': string } | {} {
  // AWS_API_GATEWAY_KEY header is needed on local development only
  const isLocal = process.env.NODE_ENV === 'development'
  const key = process.env.AWS_API_GATEWAY_KEY
  if (isLocal) {
    if (!key) {
      throw new Error('Missing AWS_API_GATEWAY_KEY')
    }
    return {
      'x-api-key': `${key}`,
    }
  } else if (key) {
    // AWS_API_GATEWAY_KEY should not be present on production
    throw new Error('AWS_API_GATEWAY_KEY is leaking to production, pleasse remove it!')
  }

  return {}
}
