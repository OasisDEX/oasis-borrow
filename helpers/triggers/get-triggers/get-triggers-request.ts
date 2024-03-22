import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'

import { getTriggersConfig } from './get-triggers-config'
import type { GetTriggersParams, GetTriggersResponse } from './get-triggers-types'

export const getTriggersRequest = async ({
  dpm,
  networkId,
}: GetTriggersParams): Promise<GetTriggersResponse> => {
  const { url } = getTriggersConfig({ dpm, networkId })

  try {
    const response = await fetch(url)
    return (await response.json()) as GetTriggersResponse
  } catch (e) {
    console.error('Failed to read data about triggers from server')
    // We are returning a default response to ensure that UI won't crash and user will have access to position
    return omniPositionTriggersDataDefault
  }
}
