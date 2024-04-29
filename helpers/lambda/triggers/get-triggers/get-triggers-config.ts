import type { GetTriggersParams } from './get-triggers-types'

export const getTriggersConfig = ({ dpm, networkId, poolId, protocol }: GetTriggersParams) => {
  return {
    url: `/api/triggers?chainId=${networkId}&dpm=${dpm.proxy}&protocol=${protocol}${poolId ? `&poolId=${poolId}` : ''}&getDetails=true`,
  }
}
