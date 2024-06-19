import type { RaysMultipliersType } from 'features/rays/types'

export interface RaysUserMultipliersResponse {
  address: string
  positionMultipliers: Record<
    string,
    { address: null; externalId: string; type: RaysMultipliersType; value: string }[]
  >
  userMultipliers: { address: string; externalId: null; type: RaysMultipliersType; value: string }[]
}

export const getRaysUserMultipliers = async ({
  walletAddress,
}: {
  walletAddress: string
}): Promise<RaysUserMultipliersResponse> => {
  const response = await fetch(`/api/rays/multipliers?address=${walletAddress}`)

  return response.json()
}
