import getConfig from 'next/config'

import type { GetTriggersParams } from './get-triggers-types'

export const getTriggersConfig = ({ dpm, networkId }: GetTriggersParams) => {
  const config = getConfig()
  const triggersUrl = config.publicRuntimeConfig.getTriggersUrl
  return {
    url: `${triggersUrl}?chainId=${networkId}&dpm=${dpm.proxy}`,
  }
}
