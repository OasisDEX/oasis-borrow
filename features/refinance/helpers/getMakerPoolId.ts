import {
  type ILKType,
  type IMakerProtocol,
  MakerLendingPoolId,
  MakerProtocol,
} from '@summer_fi/summerfi-protocol-plugins'
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
    }) as any as IMakerProtocol,
    ilkType: ilkType as ILKType,
    collateralToken,
    debtToken,
  })
}
