import type { PositionRaysMultipliersData } from 'features/rays/types'
import { UserRaysMultipliersType } from 'features/rays/types'

export const getProtocolBoost = (positionRaysMultipliersData: PositionRaysMultipliersData) =>
  positionRaysMultipliersData.user.find(
    (item) => item.type === UserRaysMultipliersType.PROTOCOL_BOOST,
  )?.value || 1
