/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from '../common/helpers'
import { ResponseBadRequest, ResponseOk } from '../common/responses'
import { getAddressFromRequest } from '../common/validators'
import { mockPositionsResponse } from './mock'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  // validate the query
  let address: string | undefined

  try {
    address = getAddressFromRequest(event)
    address
  } catch (error) {
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  return ResponseOk({ body: mockPositionsResponse.response })
}

export default handler
