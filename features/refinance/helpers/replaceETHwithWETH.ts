import {
  isAaveV3LendingPoolId,
  isMakerLendingPoolId,
  isSparkLendingPoolId,
} from '@summer_fi/summerfi-protocol-plugins'
import { type ILendingPoolId, type ITokenAmount, TokenAmount } from '@summer_fi/summerfi-sdk-common'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'

export const replaceTokenAmountETHWithWETH = (tokenAmount: ITokenAmount): ITokenAmount => {
  if (tokenAmount.token.symbol === 'ETH') {
    return TokenAmount.createFrom({
      token: mapTokenToSdkToken(tokenAmount.token.chainInfo, 'WETH'),
      amount: tokenAmount.amount,
    })
  }
  return tokenAmount
}

export const replaceTokenSymbolETHWithWETH = (tokenSymbol: string) => {
  if (tokenSymbol === 'ETH') {
    return 'WETH'
  }
  return tokenSymbol
}

export const replacePoolIdETHWithWETH = (poolId: ILendingPoolId): ILendingPoolId => {
  if (
    isMakerLendingPoolId(poolId) ||
    isSparkLendingPoolId(poolId) ||
    isAaveV3LendingPoolId(poolId)
  ) {
    const _poolId = poolId as { collateralToken: string; debtToken: string } & ILendingPoolId
    _poolId.collateralToken = replaceTokenSymbolETHWithWETH(_poolId.collateralToken)
    _poolId.debtToken = replaceTokenSymbolETHWithWETH(_poolId.debtToken)
    return _poolId
  }

  return poolId
}
