import type { PositionRaysMultipliersData } from 'features/rays/types'
import { PositionRaysMultipliersType } from 'features/rays/types'

export const getTimeOpenBoost = (positionRaysMultipliersData: PositionRaysMultipliersData) =>
  positionRaysMultipliersData.position.find(
    (item) => item.type === PositionRaysMultipliersType.TIME_OPEN,
  )?.value || 1
