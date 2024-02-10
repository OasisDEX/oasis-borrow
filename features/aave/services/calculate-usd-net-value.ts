import type { IPosition } from '@oasisdex/dma-library'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import type { BaseAaveContext } from 'features/aave/types'

export function calculateUsdNetValueBasedOnState({
  currentPosition,
  balance,
}: BaseAaveContext): BigNumber {
  if (!currentPosition) {
    return new BigNumber(0)
  }

  if (balance?.collateral.price === undefined || balance?.debt.price === undefined) {
    return new BigNumber(0)
  }

  return calculateUsdNetValue(currentPosition, balance.collateral.price, balance.debt.price)
}

export function calculateUsdNetValue(
  position: IPosition,
  collateralTokenPrice: BigNumber,
  debtTokenPrice: BigNumber,
) {
  const collateral = amountFromWei(position.collateral.amount, position.collateral.precision)
  const debt = amountFromWei(position.debt.amount, position.debt.precision)

  // (collateral_amount * collateral_token_oracle_price - debt_token_amount * debt_token_oracle_price) / USDC_oracle_price

  return collateral.times(collateralTokenPrice).minus(debt.times(debtTokenPrice))
}
