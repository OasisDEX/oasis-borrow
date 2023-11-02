export function getAwsInfraHeader(): { 'x-api-key': string } {
  const key = process.env.AWS_API_GATEWAY_KEY
  if (!key) {
    throw new Error('Missing AWS_API_GATEWAY_KEY')
  }
  return {
    'x-api-key': `${key}`,
  }
}
