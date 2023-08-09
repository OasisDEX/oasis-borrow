import { IPosition } from '@oasisdex/dma-library'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { NaNIsZero } from 'helpers/nanIsZero'

export function calculateViewValuesForPosition(
  position: IPosition,
  collateralTokenPrice: BigNumber,
  debtTokenPrice: BigNumber,
  collateralLiquidityRate: BigNumber,
  debtVariableBorrowRate: BigNumber,
) {
  const collateral = amountFromWei(position.collateral.amount, position.collateral.precision)
  const debt = amountFromWei(position.debt.amount, position.debt.precision)

  // collateral * usdprice * maxLTV - debt * usdprice
  const buyingPower = collateral
    .times(collateralTokenPrice)
    .times(position.category.maxLoanToValue)
    .minus(debt.times(debtTokenPrice))

  // (collateral_amount * collateral_token_oracle_price - debt_token_amount * debt_token_oracle_price) / USDC_oracle_price
  const netValue = collateral.times(collateralTokenPrice).minus(debt.times(debtTokenPrice))

  const totalExposure = collateral

  const liquidationPrice = NaNIsZero(
    debt.div(collateral.times(position.category.liquidationThreshold)),
  )

  const costOfBorrowingDebt = debtVariableBorrowRate.times(debt).times(debtTokenPrice)
  const profitFromProvidingCollateral = collateralLiquidityRate
    .times(collateral)
    .times(collateralTokenPrice)
  const netBorrowCostPercentage = costOfBorrowingDebt
    .minus(profitFromProvidingCollateral)
    .div(netValue)

  return {
    collateral,
    debt,
    buyingPower,
    netValue,
    totalExposure,
    liquidationPrice,
    netBorrowCostPercentage,
  }
}
