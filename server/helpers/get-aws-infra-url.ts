export function getAwsInfraUrl(): string {
  const url = process.env.AWS_API_GATEWAY_URL
  if (!url) {
    throw new Error('Missing AWS_API_GATEWAY_URL')
  }
  return url
}
