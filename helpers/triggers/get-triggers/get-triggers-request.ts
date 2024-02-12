import { getTriggersConfig } from './get-triggers-config'
import type { GetTriggersParams, GetTriggersResponse } from './get-triggers-types'

export const getTriggersRequest = async ({
  dpm,
  networkId,
}: GetTriggersParams): Promise<GetTriggersResponse> => {
  const { url } = getTriggersConfig({ dpm, networkId })

  const response = await fetch(url)
  return (await response.json()) as GetTriggersResponse
}
