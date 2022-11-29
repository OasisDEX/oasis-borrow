import { IPosition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'

export function getLiquidationPriceAccountingForPrecision(position: IPosition): BigNumber {
  return amountFromWei(position.debt.amount, position.debt.precision).div(
    amountFromWei(position.collateral.amount, position.collateral.precision).times(
      position.category.liquidationThreshold,
    ),
  )
}
