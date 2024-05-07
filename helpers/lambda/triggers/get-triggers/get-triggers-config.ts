import type { GetTriggersParams } from './get-triggers-types'

export const getTriggersConfig = ({ dpmProxy, networkId, poolId, protocol }: GetTriggersParams) => {
  return {
    url: `/api/triggers?chainId=${networkId}&dpm=${dpmProxy}&protocol=${protocol}${poolId ? `&poolId=${poolId}` : ''}&getDetails=true`,
  }
}
