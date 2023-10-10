import type BigNumber from 'bignumber.js'
import { NaNIsZero } from 'helpers/nanIsZero'
import { one, zero } from 'helpers/zero'

export interface LiquidationPriceParams {
  liquidationRatio: BigNumber
  collateral: {
    amount: BigNumber
    precision: number
  }
  debt: {
    amount: BigNumber
    precision: number
  }
}

export interface LiquidationPriceResult {
  liquidationPriceInDebt: BigNumber
  liquidationPriceInCollateral: BigNumber
}
export const calculateLiquidationPrice = ({
  liquidationRatio,
  debt,
  collateral,
}: LiquidationPriceParams): LiquidationPriceResult => {
  const normalizedCollateral = collateral.amount.dividedBy(10 ** collateral.precision)
  const normalizedDebt = debt.amount.dividedBy(10 ** debt.precision)

  const liquidationPriceInDebt = NaNIsZero(
    normalizedDebt.div(normalizedCollateral.times(liquidationRatio)),
  )

  const liquidationPriceInCollateral = liquidationPriceInDebt.isZero()
    ? zero
    : NaNIsZero(one.div(liquidationPriceInDebt))

  return {
    liquidationPriceInDebt,
    liquidationPriceInCollateral,
  }
}
