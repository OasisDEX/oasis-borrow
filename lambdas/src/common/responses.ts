import type { APIGatewayProxyResultV2 } from 'aws-lambda'

import type { DefaultErrorResponse } from './types'

export function createOkBody(obj: Record<string, any>): string {
  return JSON.stringify(obj)
}

export function createErrorBody(message: string): string {
  const errorObject: DefaultErrorResponse = { message }
  return JSON.stringify(errorObject)
}

export function ResponseOk<T extends Record<string, any>>({
  body,
}: {
  body: T
}): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    body: createOkBody(body),
  }
}

export function ResponseBadRequest(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 400,
    body: createErrorBody(message),
  }
}

export function ResponseInternalServerError(
  message: string = 'Internal server error',
): APIGatewayProxyResultV2 {
  return {
    statusCode: 500,
    body: createErrorBody(message),
  }
}
