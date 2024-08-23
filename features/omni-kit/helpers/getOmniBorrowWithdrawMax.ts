import type { LendingPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface BorrowCollateralMaxParams {
  collateralPrecision: number
  position: LendingPosition
  simulation?: LendingPosition
}

export function getOmniBorrowWithdrawMax({
  collateralPrecision,
  position: {
    collateralAmount,
    debtAmount,
    maxRiskRatio: { loanToValue },
    marketPrice,
  },
  simulation,
}: BorrowCollateralMaxParams) {
  const resolvedDebtAmount = simulation?.debtAmount || debtAmount
  const resolvedLtv = simulation?.maxRiskRatio.loanToValue || loanToValue

  return collateralAmount
    .minus(resolvedDebtAmount.div(resolvedLtv).div(marketPrice))
    .decimalPlaces(collateralPrecision, BigNumber.ROUND_DOWN)
}
