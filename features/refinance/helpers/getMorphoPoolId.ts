import { MorphoLendingPoolId } from '@summer_fi/summerfi-sdk-client'
import { type ChainInfo, ProtocolName } from '@summer_fi/summerfi-sdk-common'

export const getMorphoPoolId = (chainInfo: ChainInfo, marketId: string) => {
  return MorphoLendingPoolId.createFrom({
    protocol: {
      name: ProtocolName.MorphoBlue,
      chainInfo,
    },
    marketId,
  })
}
