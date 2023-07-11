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
    const earnPosition = response.account.earnPositions[0]
    const cumulativeValues = {
      cumulativeDeposit: new BigNumber(earnPosition.account.cumulativeDeposit),
      cumulativeFees: new BigNumber(earnPosition.account.cumulativeFees),
      cumulativeWithdraw: new BigNumber(earnPosition.account.cumulativeWithdraw),
    }

    return earnPosition.lps > 0
      ? {
          lps: new BigNumber(earnPosition.lps),
          priceIndex: new BigNumber(earnPosition.index),
          nftID: earnPosition.nft?.id || null,
          ...cumulativeValues,
        }
      : {
          ...defaultResponse,
          ...cumulativeValues,
        }
  }

  return defaultResponse
}
