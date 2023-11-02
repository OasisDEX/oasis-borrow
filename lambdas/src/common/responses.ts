import type { APIGatewayProxyResultV2 } from 'aws-lambda'

import type { DefaultErrorResponse } from './types'

export function createOkBody(message: string): string {
  const errorObject: DefaultErrorResponse = { message }
  return JSON.stringify(errorObject)
}

export function createErrorBody(message: string): string {
  const errorObject: DefaultErrorResponse = { message }
  return JSON.stringify(errorObject)
}

export function OkResponse(body: any): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    body,
  }
}

export function BadRequestResponse(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 400,
    body: createErrorBody(message),
  }
}

export function InternalServerErrorResponse(
  message: string = 'Internal server error',
): APIGatewayProxyResultV2 {
  return {
    statusCode: 500,
    body: createErrorBody(message),
  }
}
