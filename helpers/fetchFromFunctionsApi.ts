import { isServer } from './isServer'

export function fetchFromFunctionsApi(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = isServer() ? process.env.FUNCTIONS_API_URL : ''
  return fetch(`${url}${input}`, init)
}
