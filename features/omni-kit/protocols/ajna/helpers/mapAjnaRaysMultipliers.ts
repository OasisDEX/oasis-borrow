import type { NetworkNames } from 'blockchain/networks'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { mapUserAndPositionRays } from 'features/rays/mapUserAndPositionRays'
import { getRaysMappedNetwork } from 'handlers/rays/getRaysMappedNetwork'
import { getRaysMappedProtocol } from 'handlers/rays/getRaysMappedProtocol'
import { LendingProtocol } from 'lendingProtocols'

export const mapAjnaRaysMultipliers = ({
  multipliers,
  dpmProxy,
  networkName,
  poolId,
}: {
  networkName: NetworkNames
  dpmProxy?: string
  multipliers?: RaysUserMultipliersResponse
  poolId?: string
}) => {
  if (!multipliers || !dpmProxy || !poolId) {
    return {
      user: [],
      position: [],
      allUserProtocols: [],
    }
  }

  const resolvedProtocol = getRaysMappedProtocol(LendingProtocol.Ajna)
  const resolvedNetwork = getRaysMappedNetwork(networkName)

  const positionMultipliersKey = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes(LendingProtocol.Ajna))
    .find((item) => {
      const [_network, , _proxy, _protocol, _poolId] = item.split('-')

      return (
        _network === resolvedNetwork &&
        _proxy.toLowerCase() === dpmProxy.toLowerCase() &&
        resolvedProtocol.includes(_protocol) &&
        _poolId.toLowerCase() === poolId.toLowerCase()
      )
    })

  return mapUserAndPositionRays({ positionMultipliersKey, multipliers })
}
