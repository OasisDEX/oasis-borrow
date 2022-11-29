import { IPosition } from '@oasisdex/oasis-actions'
import { BigNumber } from 'bignumber.js'
import { amountFromWei } from '@oasisdex/utils'

export function getLiquidationPriceAccountingForPrecision(position: IPosition): BigNumber {
  return amountFromWei(position.debt.amount, position.debt.precision).div(
    amountFromWei(position.collateral.amount, position.collateral.precision).times(
      position.category.liquidationThreshold,
    ),
  )
}
