import { MakerLendingPoolId } from 'summerfi-sdk-client'
import { type ChainInfo, type IToken, ProtocolName } from 'summerfi-sdk-common'

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
