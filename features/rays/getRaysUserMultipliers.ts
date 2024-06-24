import type { PositionRaysMultipliersType, UserRaysMultipliersType } from 'features/rays/types'

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
  const response = await fetch(`/api/rays/multipliers?address=${walletAddress}`)

  return response.json()
}
