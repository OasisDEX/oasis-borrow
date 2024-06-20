import { isLendingProtocolType } from 'features/omni-kit/helpers/isLendingProtocolType'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { mapRaysProtocolToOmni } from 'features/rays/mapRaysProtocolToOmni'
import type { PositionRaysMultipliersData } from 'features/rays/types'

export const mapUserAndPositionRays = ({
  positionMultipliersKey,
  multipliers,
}: {
  positionMultipliersKey?: string
  multipliers: RaysUserMultipliersResponse
}): PositionRaysMultipliersData => {
  const rawPositionMultipliers = multipliers.positionMultipliers[positionMultipliersKey || ''] ?? []

  const allUserProtocols = [
    ...new Set(
      Object.keys(multipliers.positionMultipliers)
        .map((item) => {
          const [, , , _protocol] = item.split('-')

          return mapRaysProtocolToOmni(_protocol)
        })
        .filter(isLendingProtocolType),
    ),
  ]

  return {
    user: multipliers.userMultipliers.map((item) => ({
      value: Number(item.value),
      type: item.type,
    })),
    position: rawPositionMultipliers.map((item) => ({
      value: Number(item.value),
      type: item.type,
    })),
    allUserProtocols,
  }
}
