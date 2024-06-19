import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { getRaysMappedNetwork } from 'handlers/rays/getRaysMappedNetwork'
import { getRaysMappedProtocol } from 'handlers/rays/getRaysMappedProtocol'
import type { LendingProtocol } from 'lendingProtocols'

export const mapAjnaRaysMultipliers = ({
  multipliers,
  protocol,
  networkName,
  dpmPositionData,
  poolId,
}: {
  protocol: LendingProtocol
  networkName: NetworkNames
  dpmPositionData?: DpmPositionData
  multipliers?: RaysUserMultipliersResponse
  poolId?: string
}) => {
  if (!multipliers || !dpmPositionData || !poolId) {
    return {
      user: [],
      position: [],
    }
  }

  const resolvedProtocol = getRaysMappedProtocol(protocol)
  const resolvedNetwork = getRaysMappedNetwork(networkName)

  const positionMultipliers = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes('ajna'))
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
