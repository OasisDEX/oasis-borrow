import type { PositionRaysMultipliersData } from 'features/rays/types'
import { PositionRaysMultipliersType } from 'features/rays/types'

export const getAutomationBoost = (positionRaysMultipliersData: PositionRaysMultipliersData) =>
  positionRaysMultipliersData.position.find(
    (item) => item.type === PositionRaysMultipliersType.AUTOMATION,
  )?.value || 1
