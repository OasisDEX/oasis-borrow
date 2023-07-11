import { GetEarnData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

const defaultResponse = {
  lps: zero,
  priceIndex: null,
  nftID: null,
  cumulativeDeposit: zero,
  cumulativeFees: zero,
  cumulativeWithdraw: zero,
}

export const getAjnaEarnData: GetEarnData = async (proxy: string) => {
  const { response } = await loadSubgraph('Ajna', 'getEarnData', {
    dpmProxyAddress: proxy.toLowerCase(),
  })

  if (
    response &&
    'account' in response &&
    response.account &&
    response.account.earnPositions.length
  ) {
    const earnPosition = response.account.earnPositions.find((position) => position.lps > 0)

    const anyPositionForCumulatives = response.account.earnPositions[0]

    const cumulativeValues = {
      cumulativeDeposit: new BigNumber(anyPositionForCumulatives.account.cumulativeDeposit),
      cumulativeFees: new BigNumber(anyPositionForCumulatives.account.cumulativeFees),
      cumulativeWithdraw: new BigNumber(anyPositionForCumulatives.account.cumulativeWithdraw),
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
