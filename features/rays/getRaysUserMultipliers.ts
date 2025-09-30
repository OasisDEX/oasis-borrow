import type { PositionRaysMultipliersType, UserRaysMultipliersType } from 'features/rays/types'
import { raysUserMultipliersMockedResponse } from 'handlers/portfolio/positions/helpers/rays-mock'

export interface RaysUserMultipliersResponse {
  address: string
  positionMultipliers: Record<
    string,
    { address: null; externalId: string; type: PositionRaysMultipliersType; value: string }[]
  >
  userMultipliers: {
    address: string
    externalId: null
    type: UserRaysMultipliersType
    value: string
  }[]
}

export const getRaysUserMultipliers = async ({
  walletAddress,
}: {
  walletAddress: string
}): Promise<RaysUserMultipliersResponse> => {
  return Promise.resolve(raysUserMultipliersMockedResponse(walletAddress))
}
