import type { RaysUserResponse } from 'features/rays/getRaysUser'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'

export const raysUserMultipliersMockedResponse: (address: string) => RaysUserMultipliersResponse = (
  address,
) => ({
  address: address,
  positionMultipliers: {},
  userMultipliers: [],
})

export const raysUserMockedResponse: () => Promise<RaysUserResponse> = () =>
  Promise.resolve({
    error: undefined,
    userRays: undefined,
  })
