import { MorphoLendingPoolId, MorphoProtocol } from '@summer_fi/summerfi-sdk-client'
import { type ChainInfo } from '@summer_fi/summerfi-sdk-common'

export const getMorphoPoolId = (chainInfo: ChainInfo, marketId: string) => {
  return MorphoLendingPoolId.createFrom({
    protocol: MorphoProtocol.createFrom({
      chainInfo: chainInfo,
    }),
    marketId: marketId as `0x${string}`,
  })
}
