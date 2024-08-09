import {
  type IMorphoProtocol,
  MorphoLendingPoolId,
  MorphoProtocol,
} from '@summer_fi/summerfi-protocol-plugins'
import { type ChainInfo } from '@summer_fi/summerfi-sdk-common'

export const getMorphoPoolId = (chainInfo: ChainInfo, marketId: string) => {
  return MorphoLendingPoolId.createFrom({
    protocol: MorphoProtocol.createFrom({
      chainInfo: chainInfo,
    }) as any as IMorphoProtocol,
    marketId: marketId as `0x${string}`,
  })
}
