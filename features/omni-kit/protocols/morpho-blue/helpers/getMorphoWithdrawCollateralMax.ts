import type { MorphoBluePosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface AjnaBorrowCollateralMaxParams {
  precision: number
  position: MorphoBluePosition
  simulation?: MorphoBluePosition
}

export function getMorphoBorrowCollateralMax({
  precision,
  position: {
    collateralAmount,
    debtAmount,
    maxRiskRatio: { loanToValue },
    price,
  },
  simulation,
}: AjnaBorrowCollateralMaxParams) {
  const resolvedDebtAmount = simulation?.debtAmount || debtAmount
  const resolvedLtv = simulation?.maxRiskRatio.loanToValue || loanToValue

  return collateralAmount
    .minus(resolvedDebtAmount.div(resolvedLtv).div(price))
    .decimalPlaces(precision, BigNumber.ROUND_DOWN)
}
