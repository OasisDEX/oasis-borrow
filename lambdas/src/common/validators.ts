import type { APIGatewayProxyEventV2 } from 'aws-lambda'

import { isValidAddress } from './guards'
import { ResponseBadRequest } from './responses'

export const getAddressFromRequest = (event: APIGatewayProxyEventV2): string => {
  const query = event.queryStringParameters
  if (query == null) {
    throw ResponseBadRequest('Missing query string')
  }

  const { address } = query

  if (!address) {
    throw ResponseBadRequest('Missing address')
  }
  if (isValidAddress(address)) {
    throw ResponseBadRequest('Invalid address')
  }

  return address
}
