import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
/**
 * Checks if given position is instance of LendingPosition
 *
 * @param position - lending or supply position type
 * @returns true if @position is type of lending position
 *
 */
export const isLendingPosition = (
  position: LendingPosition | SupplyPosition,
): position is LendingPosition => {
  // `borrowRate` property is uniq for Lending Position
  return 'borrowRate' in position
}
