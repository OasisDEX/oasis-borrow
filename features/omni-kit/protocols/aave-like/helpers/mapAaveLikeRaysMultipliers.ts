import type { NetworkNames } from 'blockchain/networks'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { mapUserAndPositionRays } from 'features/rays/mapUserAndPositionRays'
import { getRaysMappedNetwork } from 'handlers/rays/getRaysMappedNetwork'
import { getRaysMappedProtocol } from 'handlers/rays/getRaysMappedProtocol'
import type { LendingProtocol } from 'lendingProtocols'

export const mapAaveLikeRaysMultipliers = ({
  multipliers,
  protocol,
  networkName,
  collateralTokenAddress,
  quoteTokenAddress,
  dpmProxy,
}: {
  protocol: LendingProtocol
  networkName: NetworkNames
  collateralTokenAddress?: string
  quoteTokenAddress?: string
  dpmProxy?: string
  multipliers?: RaysUserMultipliersResponse
}) => {
  if (!multipliers || !collateralTokenAddress || !quoteTokenAddress || !dpmProxy) {
    return {
      user: [],
      position: [],
      allUserProtocols: [],
    }
  }

  const resolvedProtocol = getRaysMappedProtocol(protocol)
  const resolvedNetwork = getRaysMappedNetwork(networkName)

  const positionMultipliersKey = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes('aave') || item.includes('spark'))
    .find((item) => {
      const [_network, , _proxy, _protocol, _tokens] = item.split('-')
      const _collateralTokenAddress = _tokens.split(':')[0].toLowerCase()
      const _debtTokenAddress = _tokens.split(':')[1].toLowerCase()

      return (
        _network === resolvedNetwork &&
        _proxy.toLowerCase() === dpmProxy.toLowerCase() &&
        resolvedProtocol.includes(_protocol) &&
        _collateralTokenAddress === collateralTokenAddress &&
        _debtTokenAddress === quoteTokenAddress
      )
    })

  return mapUserAndPositionRays({ positionMultipliersKey, multipliers })
}
