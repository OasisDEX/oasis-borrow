import { IPosition } from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'

export function getLiquidationPriceAccountingForPrecision(position: IPosition): BigNumber {
  return amountFromWei(position.debt.amount, position.debt.symbol).div(
    amountFromWei(position.collateral.amount, position.collateral.symbol).times(
      position.category.liquidationThreshold,
    ),
  )
}
