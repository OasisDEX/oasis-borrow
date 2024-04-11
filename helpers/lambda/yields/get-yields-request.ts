import { getYieldsConfig } from './get-yields-config'
import type { GetYieldsParams, GetYieldsResponse } from './get-yields-types'

export const getYieldsRequest = async (params: GetYieldsParams): Promise<GetYieldsResponse> => {
  const { url, body } = getYieldsConfig(params)

  try {
    const response = await fetch(url, {
      method: 'POST',
      body,
    })
    return (await response.json()) as GetYieldsResponse
  } catch (e) {
    console.error('Failed to read data about yields from server', e)
    return {}
  }
}
