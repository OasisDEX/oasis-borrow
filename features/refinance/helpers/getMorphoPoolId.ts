import { MorphoLendingPoolId } from 'summerfi-sdk-client'
import { type ChainInfo, ProtocolName } from 'summerfi-sdk-common'

export const getMorphoPoolId = (chainInfo: ChainInfo, marketId: string) => {
  return MorphoLendingPoolId.createFrom({
    protocol: {
      name: ProtocolName.MorphoBlue,
      chainInfo,
    },
    marketId,
  })
}
