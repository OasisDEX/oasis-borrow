import { getYieldsConfig } from './get-yields-config'
import type { GetYieldsParams, GetYieldsResponse } from './get-yields-types'

export const getYieldsRequest = async (
  params: GetYieldsParams,
  urlPrefix?: string,
): Promise<GetYieldsResponse | null> => {
  const { url } = getYieldsConfig(params)

  try {
    const response = await fetch(`${urlPrefix ?? ''}${url}`, {
      method: 'GET',
    })
    return (await response.json()) as GetYieldsResponse
  } catch (e) {
    console.error('Failed to read data about yields from server', e)
    return null
  }
}
