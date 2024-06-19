export interface RaysUserMultipliersResponse {
  address: string
  positionMultipliers: Record<
    string,
    { address: null; externalId: string; type: string; value: string }[]
  >
  userMultipliers: { address: string; externalId: null; type: string; value: string }[]
}

export const getRaysUserMultipliers = async ({
  walletAddress,
}: {
  walletAddress: string
}): Promise<RaysUserMultipliersResponse> => {
  const response = await fetch(`/api/rays/multipliers?address=${walletAddress}`)

  return response.json()
}
