import type { NetworkNames } from 'blockchain/networks'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { mapUserAndPositionRays } from 'features/rays/mapUserAndPositionRays'
import { replaceTokenSymbolWETHWithETH } from 'features/refinance/helpers/replaceWETHWithETH'
import { getRaysMappedNetwork } from 'handlers/rays/getRaysMappedNetwork'
import { getRaysMappedProtocol } from 'handlers/rays/getRaysMappedProtocol'
import type { LendingProtocol } from 'lendingProtocols'

export const mapMorphoBlueRaysMultipliers = ({
  multipliers,
  protocol,
  networkName,
  networkId,
  collateralToken,
  quoteToken,
  dpmProxy,
  pairId,
}: {
  protocol: LendingProtocol
  networkName: NetworkNames
  networkId: OmniSupportedNetworkIds
  collateralToken?: string
  quoteToken?: string
  dpmProxy?: string
  multipliers?: RaysUserMultipliersResponse
  pairId: number
}) => {
  if (!multipliers || !collateralToken || !quoteToken || !dpmProxy) {
    return {
      user: [],
      position: [],
      allUserProtocols: [],
    }
  }

  const resolvedCollateralToken = replaceTokenSymbolWETHWithETH(collateralToken.toUpperCase())
  const resolvedQuoteToken = replaceTokenSymbolWETHWithETH(quoteToken.toUpperCase())

  const poolId =
    morphoMarkets[networkId]?.[
      `${resolvedCollateralToken.toUpperCase()}-${resolvedQuoteToken.toUpperCase()}`
    ][pairId - 1]

  if (!poolId) {
    return {
      user: [],
      position: [],
      allUserProtocols: [],
    }
  }

  const resolvedProtocol = getRaysMappedProtocol(protocol)
  const resolvedNetwork = getRaysMappedNetwork(networkName)

  const positionMultipliersKey = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes('morphoblue') || item.includes('erc4626'))
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
