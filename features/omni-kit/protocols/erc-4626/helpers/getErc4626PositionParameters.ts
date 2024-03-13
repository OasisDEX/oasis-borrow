import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface Erc4626PositionParametersResponse {
  earnCumulativeDepositInQuoteToken: string
  earnCumulativeDepositUSD: string
  earnCumulativeFeesInQuoteToken: string
  earnCumulativeFeesUSD: string
  earnCumulativeWithdrawInQuoteToken: string
  earnCumulativeWithdrawUSD: string
  id: string
  shares: string
  vault: {
    fee?: string
    curator?: string
    totalAssets: string
    totalShares: string
  }
}

const emptyErc4626PositionParametersResponse = {
  earnCumulativeDepositInQuoteToken: '0',
  earnCumulativeDepositUSD: '0',
  earnCumulativeFeesInQuoteToken: '0',
  earnCumulativeFeesUSD: '0',
  earnCumulativeWithdrawInQuoteToken: '0',
  earnCumulativeWithdrawUSD: '0',
  id: '',
  shares: '0',
  vault: {
    totalAssets: '0',
    totalShares: '0',
  },
}

export function getErc4626PositionParameters(networkId: OmniSupportedNetworkIds) {
  return async (vaultAddress: string, dpmProxyAddress: string) => {
    const { response } = (await loadSubgraph('Erc4626', 'getErc4626PositionParameters', networkId, {
      dpmProxyAddress: dpmProxyAddress.toLowerCase(),
      vault: vaultAddress.toLowerCase(),
    })) as SubgraphsResponses['Erc4626']['getErc4626PositionParameters']

    return response[0] ?? emptyErc4626PositionParametersResponse
  }
}
