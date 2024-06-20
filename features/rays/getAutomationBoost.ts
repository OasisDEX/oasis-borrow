import type { PositionRaysMultipliersData } from 'features/rays/types'
import { RaysMultipliersType } from 'features/rays/types'

export const getAutomationBoost = (positionRaysMultipliersData: PositionRaysMultipliersData) =>
  positionRaysMultipliersData.position.find((item) => item.type === RaysMultipliersType.AUTOMATION)
    ?.value || 1
