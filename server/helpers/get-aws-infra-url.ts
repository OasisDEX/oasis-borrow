import { config } from 'server/config'

export function getAwsInfraUrl(): string {
  const { awsApiGatewayUrl: url } = config
  if (!url) {
    throw new Error('Missing AWS_API_GATEWAY_URL')
  }
  return url
}
