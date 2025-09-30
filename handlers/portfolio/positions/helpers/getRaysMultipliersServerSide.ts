import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { raysUserMultipliersMockedResponse } from 'handlers/portfolio/positions/helpers/rays-mock'

export const getRaysUserMultipliersServerSide = async ({
  address,
}: {
  address: string
}): Promise<RaysUserMultipliersResponse> => {
  return Promise.resolve(raysUserMultipliersMockedResponse(address))
}
