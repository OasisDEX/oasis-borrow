import type { PositionRaysMultipliersData } from 'features/rays/types'
import { RaysMultipliersType } from 'features/rays/types'

export const getProtocolBoost = (positionRaysMultipliersData: PositionRaysMultipliersData) =>
  positionRaysMultipliersData.user.find((item) => item.type === RaysMultipliersType.PROTOCOL_BOOST)
    ?.value || 1
