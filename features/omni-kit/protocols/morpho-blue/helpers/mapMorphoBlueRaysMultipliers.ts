import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { getRaysMappedNetwork } from 'handlers/rays/getRaysMappedNetwork'
import { getRaysMappedProtocol } from 'handlers/rays/getRaysMappedProtocol'
import type { LendingProtocol } from 'lendingProtocols'

export const mapMorphoBlueRaysMultipliers = ({
  multipliers,
  protocol,
  networkName,
  networkId,
  dpmPositionData,
  pairId,
}: {
  protocol: LendingProtocol
  networkName: NetworkNames
  networkId: OmniSupportedNetworkIds
  dpmPositionData?: DpmPositionData
  multipliers?: RaysUserMultipliersResponse
  pairId: number
}) => {
  if (!multipliers || !dpmPositionData) {
    return {
      user: [],
      position: [],
    }
  }

  const poolId =
    morphoMarkets[networkId]?.[`${dpmPositionData.collateralToken}-${dpmPositionData.quoteToken}`][
      pairId - 1
    ]

  if (!poolId) {
    return {
      user: [],
      position: [],
    }
  }

  const resolvedProtocol = getRaysMappedProtocol(protocol)
  const resolvedNetwork = getRaysMappedNetwork(networkName)

  const positionMultipliers = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes('morphoblue'))
    .find((item) => {
      const [_network, _walletAddress, _proxy, _protocol, _poolId, _type] = item.split('-')

      return (
        _network === resolvedNetwork &&
        _proxy.toLowerCase() === dpmPositionData.proxy.toLowerCase() &&
        resolvedProtocol.includes(_protocol) &&
        _poolId.toLowerCase() === poolId.toLowerCase()
      )
    })

  const rawPositionMultipliers = multipliers.positionMultipliers[positionMultipliers || ''] ?? []

  return {
    user: multipliers.userMultipliers.map((item) => ({
      value: new BigNumber(item.value),
      type: item.type,
    })),
    position: rawPositionMultipliers.map((item) => ({
      value: new BigNumber(item.value),
      type: item.type,
    })),
  }
}
