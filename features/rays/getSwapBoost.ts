import type { PositionRaysMultipliersData } from 'features/rays/types'
import { RaysMultipliersType } from 'features/rays/types'

export const getSwapBoost = (positionRaysMultipliersData: PositionRaysMultipliersData) =>
  positionRaysMultipliersData.user.find((item) => item.type === RaysMultipliersType.SWAP)
    ?.value || 1
