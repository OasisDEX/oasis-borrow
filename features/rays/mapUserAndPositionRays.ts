import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import type { PositionRaysMultipliersData } from 'features/rays/types'

export const mapUserAndPositionRays = ({
  positionMultipliersKey,
  multipliers,
}: {
  positionMultipliersKey?: string
  multipliers: RaysUserMultipliersResponse
}): PositionRaysMultipliersData => {
  const rawPositionMultipliers = multipliers.positionMultipliers[positionMultipliersKey || ''] ?? []

  return {
    user: multipliers.userMultipliers.map((item) => ({
      value: Number(item.value),
      type: item.type,
    })),
    position: rawPositionMultipliers.map((item) => ({
      value: Number(item.value),
      type: item.type,
    })),
  }
}
