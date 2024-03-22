import type { GetTriggersParams } from './get-triggers-types'

export const getTriggersConfig = ({ dpm, networkId }: GetTriggersParams) => {
  return {
    url: `/api/triggers?chainId=${networkId}&dpm=${dpm.proxy}&getDetails=true`,
  }
}
