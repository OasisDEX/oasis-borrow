import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import type { MakerLendingPoolId } from '@summer_fi/summerfi-sdk-client'
import {
  isAaveV3LendingPoolId,
  isMakerLendingPoolId,
  isSparkLendingPoolId,
} from '@summer_fi/summerfi-sdk-client'
import { type IPoolId, type ITokenAmount, TokenAmount } from '@summer_fi/summerfi-sdk-common'

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

export const replacePoolIdETHWithWETH = (poolId: IPoolId): IPoolId => {
  if (
    isMakerLendingPoolId(poolId) ||
    isSparkLendingPoolId(poolId) ||
    isAaveV3LendingPoolId(poolId)
  ) {
    const _poolId = poolId as typeof MakerLendingPoolId
    _poolId.collateralToken = replaceTokenSymbolETHWithWETH(_poolId.collateralToken)
    _poolId.debtToken = replaceTokenSymbolETHWithWETH(_poolId.debtToken)
    return _poolId
  }

  return poolId
}
