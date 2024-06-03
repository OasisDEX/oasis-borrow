import { MakerLendingPoolId } from '@summer_fi/summerfi-sdk-client'
import { type ChainInfo, type IToken, ProtocolName } from '@summer_fi/summerfi-sdk-common'

export const getMakerPoolId = (
  chainInfo: ChainInfo,
  ilkType: string,
  collateralToken: IToken,
  debtToken: IToken,
) => {
  return MakerLendingPoolId.createFrom({
    protocol: {
      name: ProtocolName.Maker,
      chainInfo,
    },
    ilkType,
    collateralToken,
    debtToken,
  })
}
