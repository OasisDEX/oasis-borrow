import type { MakerPosition } from '@oasisdex/dma-library'
import { zero } from 'helpers/zero'

interface BorrowCollateralMaxParams {
  collateralPrecision: number
  position: MakerPosition
  simulation?: MakerPosition
}

// eslint-disable-next-line no-empty-pattern
export function getMakerBorrowWithdrawMax({}: BorrowCollateralMaxParams) {
  // TODO
  return zero
}
