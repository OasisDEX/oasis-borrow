import type { PositionRaysMultipliersData } from 'features/rays/types'
import { UserRaysMultipliersType } from 'features/rays/types'

export const getSwapBoost = (positionRaysMultipliersData: PositionRaysMultipliersData) =>
  positionRaysMultipliersData.user.find((item) => item.type === UserRaysMultipliersType.SWAP)
    ?.value || 1
