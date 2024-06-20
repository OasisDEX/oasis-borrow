import type { NetworkNames } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { mapUserAndPositionRays } from 'features/rays/mapUserAndPositionRays'
import { getRaysMappedNetwork } from 'handlers/rays/getRaysMappedNetwork'

export const mapErc4626RaysMultipliers = ({
  multipliers,
  networkName,
  dpmPositionData,
  poolId,
}: {
  networkName: NetworkNames
  dpmPositionData?: DpmPositionData
  multipliers?: RaysUserMultipliersResponse
  poolId: string
}) => {
  if (!multipliers || !dpmPositionData || !poolId) {
    return {
      user: [],
      position: [],
      allUserProtocols: [],
    }
  }

  const resolvedProtocol = Erc4626PseudoProtocol.replace('-', '')
  const resolvedNetwork = getRaysMappedNetwork(networkName)

  const positionMultipliersKey = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes(resolvedProtocol))
    .find((item) => {
      const [_network, , _proxy, _protocol, _poolId] = item.split('-')

      return (
        _network === resolvedNetwork &&
        _proxy.toLowerCase() === dpmPositionData.proxy.toLowerCase() &&
        resolvedProtocol.includes(_protocol) &&
        _poolId.toLowerCase().includes(poolId.toLowerCase())
      )
    })

  return mapUserAndPositionRays({ positionMultipliersKey, multipliers })
}
