import type { APIGatewayProxyEventV2 } from 'aws-lambda'

import { isValidAddress } from './guards'

export const getAddressFromRequest = (event: APIGatewayProxyEventV2): string => {
  const query = event.queryStringParameters
  if (query == null) {
    throw Error('Missing query string')
  }

  const { address } = query

  if (!address) {
    throw Error('Missing address')
  }
  if (isValidAddress(address)) {
    throw Error('Invalid address')
  }

  return address
}
