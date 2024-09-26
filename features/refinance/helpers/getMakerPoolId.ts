import { MakerLendingPoolId, MakerProtocol } from '@summer_fi/summerfi-sdk-client'
import { type ChainInfo, type IToken } from '@summer_fi/summerfi-sdk-common'

export const getMakerPoolId = (
  chainInfo: ChainInfo,
  ilkType: string,
  collateralToken: IToken,
  debtToken: IToken,
) => {
  return MakerLendingPoolId.createFrom({
    protocol: MakerProtocol.createFrom({
      chainInfo: chainInfo,
    }),
    ilkType: ilkType,
    collateralToken,
    debtToken,
  })
}
