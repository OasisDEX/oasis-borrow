import { GetEarnData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

const defaultResponse = {
  lps: zero,
  priceIndex: null,
  nftID: null,
  earnCumulativeQuoteTokenDeposit: zero,
  earnCumulativeFeesInQuoteToken: zero,
  earnCumulativeQuoteTokenWithdraw: zero,
}

export const getAjnaEarnData: GetEarnData = async (proxy: string) => {
  const { response } = (await loadSubgraph('Ajna', 'getAjnaEarnPositionData', {
    dpmProxyAddress: proxy.toLowerCase(),
  })) as SubgraphsResponses['Ajna']['getAjnaEarnPositionData']

  if (
    response &&
    'account' in response &&
    response.account &&
    response.account.earnPositions.length
  ) {
    const earnPosition = response.account.earnPositions.find((position) => position.lps > 0)

    const anyPositionForCumulatives = response.account.earnPositions[0]

    const cumulativeValues = {
      earnCumulativeQuoteTokenDeposit: new BigNumber(
        anyPositionForCumulatives.account.earnCumulativeQuoteTokenDeposit,
      ),
      earnCumulativeFeesInQuoteToken: new BigNumber(
        anyPositionForCumulatives.account.earnCumulativeFeesInQuoteToken,
      ),
      earnCumulativeQuoteTokenWithdraw: new BigNumber(
        anyPositionForCumulatives.account.earnCumulativeQuoteTokenWithdraw,
      ),
    }

    if (!earnPosition) {
      return {
        ...defaultResponse,
        ...cumulativeValues,
      }
    }

    return {
      lps: new BigNumber(earnPosition.lps),
      priceIndex: new BigNumber(earnPosition.index),
      nftID: earnPosition.nft?.id || null,
      ...cumulativeValues,
    }
  }

  return defaultResponse
}
