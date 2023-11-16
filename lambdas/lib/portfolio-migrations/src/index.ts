/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from 'shared/dist/helpers'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from 'shared/dist/responses'
import { getAddressFromRequest } from 'shared/dist/validators'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  //set envs
  const {} = (event.stageVariables as Record<string, string>) || {}

  // validate the query
  let address: string | undefined
  try {
    address = getAddressFromRequest(event)
  } catch (error) {
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  try {
    const body = 'TODO'
    return ResponseOk<any>({ body })
  } catch (error) {
    console.error(error)
    return ResponseInternalServerError()
  }
}

export default handler
