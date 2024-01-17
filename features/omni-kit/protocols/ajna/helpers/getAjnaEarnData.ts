import type { GetEarnData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

const defaultResponse = {
  lps: zero,
  priceIndex: null,
  earnCumulativeQuoteTokenDeposit: zero,
  earnCumulativeFeesInQuoteToken: zero,
  earnCumulativeQuoteTokenWithdraw: zero,
}

export const getAjnaEarnData: (networkId: OmniSupportedNetworkIds) => GetEarnData =
  (networkId) => async (proxy: string, poolAddress: string) => {
    const { response } = (await loadSubgraph('Ajna', 'getAjnaEarnPositionData', networkId, {
      dpmProxyAddress: proxy.toLowerCase(),
      poolAddress: poolAddress.toLowerCase(),
    })) as SubgraphsResponses['Ajna']['getAjnaEarnPositionData']

    if (
      response &&
      'account' in response &&
      response.account &&
      response.account.earnPositions.length
    ) {
      const earnPosition = response.account.earnPositions[0]

      const cumulativeValues = {
        earnCumulativeQuoteTokenDeposit: new BigNumber(
          earnPosition.earnCumulativeQuoteTokenDeposit,
        ),
        earnCumulativeFeesInQuoteToken: new BigNumber(earnPosition.earnCumulativeFeesInQuoteToken),
        earnCumulativeQuoteTokenWithdraw: new BigNumber(
          earnPosition.earnCumulativeQuoteTokenWithdraw,
        ),
      }

      if (!earnPosition || !earnPosition.bucketPositions.length) {
        return {
          ...defaultResponse,
          ...cumulativeValues,
        }
      }

      // In case when user accidentally deposits into two or more separate buckets, take the one with the highest lps
      const bucketWithTheHighestLps = earnPosition.bucketPositions.reduce(
        (max, current) => (Number(current.lps) > Number(max.lps) ? current : max),
        earnPosition.bucketPositions[0],
      )

      return {
        lps: new BigNumber(bucketWithTheHighestLps.lps),
        priceIndex: new BigNumber(bucketWithTheHighestLps.index),
        ...cumulativeValues,
      }
    }

    return defaultResponse
  }
