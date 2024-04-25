import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface Erc4626PositionParametersResponse {
  positions: {
    earnCumulativeDepositInQuoteToken: string
    earnCumulativeDepositUSD: string
    earnCumulativeFeesInQuoteToken: string
    earnCumulativeFeesUSD: string
    earnCumulativeWithdrawInQuoteToken: string
    earnCumulativeWithdrawUSD: string
    id: string
    shares: string
  }[]
  vaults: {
    interestRates: {
      timestamp: string
      rate: string
    }[]
    totalAssets: string
    totalShares: string
  }[]
}

const emptyErc4626PositionParametersResponse: Erc4626PositionParametersResponse = {
  positions: [
    {
      earnCumulativeDepositInQuoteToken: '0',
      earnCumulativeDepositUSD: '0',
      earnCumulativeFeesInQuoteToken: '0',
      earnCumulativeFeesUSD: '0',
      earnCumulativeWithdrawInQuoteToken: '0',
      earnCumulativeWithdrawUSD: '0',
      id: '',
      shares: '0',
    },
  ],
  vaults: [
    {
      interestRates: [],
      totalAssets: '0',
      totalShares: '0',
    },
  ],
}

export function getErc4626PositionParameters(networkId: OmniSupportedNetworkIds) {
  return async (vaultAddress: string, dpmProxyAddress: string) => {
    const { response } = (await loadSubgraph({
      subgraph: 'Erc4626',
      method: 'getErc4626PositionParameters',
      networkId,
      params: {
        dpmProxyAddress: dpmProxyAddress.toLowerCase(),
        vault: vaultAddress.toLowerCase(),
      },
    })) as SubgraphsResponses['Erc4626']['getErc4626PositionParameters']

    return {
      positions:
        response.positions.length > 0
          ? response.positions
          : emptyErc4626PositionParametersResponse.positions,
      vaults:
        response.vaults.length > 0
          ? response.vaults
          : emptyErc4626PositionParametersResponse.vaults,
    }
  }
}
