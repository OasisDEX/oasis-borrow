import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import { getRaysMappedNetwork } from 'handlers/rays/getRaysMappedNetwork'
import { getRaysMappedProtocol } from 'handlers/rays/getRaysMappedProtocol'
import type { LendingProtocol } from 'lendingProtocols'

export const mapAaveLikeRaysMultipliers = ({
  multipliers,
  protocol,
  networkName,
  dpmPositionData,
}: {
  protocol: LendingProtocol
  networkName: NetworkNames
  dpmPositionData?: DpmPositionData
  multipliers?: RaysUserMultipliersResponse
}) => {
  if (!multipliers || !dpmPositionData) {
    return {
      user: [],
      position: [],
    }
  }

  const resolvedProtocol = getRaysMappedProtocol(protocol)
  const resolvedNetwork = getRaysMappedNetwork(networkName)

  const positionMultipliers = Object.keys(multipliers.positionMultipliers)
    .filter((item) => item.includes('aave') || item.includes('spark'))
    .find((item) => {
      const [_network, _walletAddress, _proxy, _protocol, _tokens, _type] = item.split('-')
      const _collateralTokenAddress = _tokens.split(':')[0].toLowerCase()
      const _debtTokenAddress = _tokens.split(':')[1].toLowerCase()

      return (
        _network === resolvedNetwork &&
        _proxy.toLowerCase() === dpmPositionData.proxy.toLowerCase() &&
        resolvedProtocol.includes(_protocol) &&
        _collateralTokenAddress === dpmPositionData.collateralTokenAddress &&
        _debtTokenAddress === dpmPositionData.quoteTokenAddress
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
