import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { fetchFromFunctionsApi } from 'helpers/fetchFromFunctionsApi'

export const getRaysUserMultipliersServerSide = async ({
  address,
}: {
  address: string
}): Promise<RaysUserMultipliersResponse> => {
  const response = await fetchFromFunctionsApi(`/api/rays/multipliers?address=${address}`)

  return response.json()
}
