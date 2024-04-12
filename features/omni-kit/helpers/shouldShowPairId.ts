import { type NetworkNames, networksByName } from 'blockchain/networks'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'

interface ShouldShowPairIdParams {
  collateralToken: string
  networkName: NetworkNames
  protocol: LendingProtocol
  quoteToken: string
}

export function shouldShowPairId({
  collateralToken,
  networkName,
  protocol,
  quoteToken,
}: ShouldShowPairIdParams) {
  const networkId = networksByName[networkName].id as OmniSupportedNetworkIds

  switch (protocol) {
    case LendingProtocol.MorphoBlue:
      return (morphoMarkets[networkId]?.[`${collateralToken}-${quoteToken}`]?.length ?? 1) > 1
    default:
      return false
  }
}
