import type { GetTriggersParams } from './get-triggers-types'

export const getTriggersConfig = ({ dpmProxy, networkId }: GetTriggersParams) => {
  return {
    url: `/api/triggers?chainId=${networkId}&dpm=${dpmProxy}&getDetails=true`,
  }
}
