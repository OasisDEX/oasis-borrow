import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
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
    }
  }

  const resolvedProtocol = Erc4626PseudoProtocol.replace('-', '')
  const resolvedNetwork = getRaysMappedNetwork(networkName)

  const positionMultipliers = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes(resolvedProtocol))
    .find((item) => {
      const [_network, _walletAddress, _proxy, _protocol, _poolId, _type] = item.split('-')

      return (
        _network === resolvedNetwork &&
        _proxy.toLowerCase() === dpmPositionData.proxy.toLowerCase() &&
        resolvedProtocol.includes(_protocol) &&
        _poolId.toLowerCase().includes(poolId.toLowerCase())
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
