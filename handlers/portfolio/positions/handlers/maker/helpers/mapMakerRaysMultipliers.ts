import { NetworkNames } from 'blockchain/networks'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { mapUserAndPositionRays } from 'features/rays/mapUserAndPositionRays'
import { getRaysMappedNetwork } from 'handlers/rays/getRaysMappedNetwork'
import { LendingProtocol } from 'lendingProtocols'

export const mapMakerRaysMultipliers = ({
  multipliers,
  dsProxy,
  ilkId,
}: {
  dsProxy?: string
  multipliers?: RaysUserMultipliersResponse
  ilkId: string
}) => {
  if (!multipliers || !dsProxy) {
    return {
      user: [],
      position: [],
      allUserProtocols: [],
    }
  }

  const resolvedNetwork = getRaysMappedNetwork(NetworkNames.ethereumMainnet)

  const positionMultipliersKey = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes(LendingProtocol.Maker))
    .find((item) => {
      const [_network, , _dsProxy, _protocol, _ilkId] = item.split('-')

      return (
        _network === resolvedNetwork &&
        _dsProxy.toLowerCase() === dsProxy.toLowerCase() &&
        _protocol === LendingProtocol.Maker &&
        _ilkId.toLowerCase() === ilkId.toLowerCase()
      )
    })

  return mapUserAndPositionRays({ positionMultipliersKey, multipliers })
}
