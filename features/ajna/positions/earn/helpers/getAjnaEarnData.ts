import BigNumber from 'bignumber.js'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

import { GetEarnData } from '@oasis-actions-poc/src/views/ajna'

export const getAjnaEarnData: GetEarnData = async (proxy: string) => {
  const response = await loadSubgraph('Ajna', 'getEarnData', {
    dpmProxyAddress: proxy,
  })

  if (response.account) {
    const earnPosition = response.account.earnPositions[0]
    return {
      lps: new BigNumber(earnPosition.lps),
      priceIndex: new BigNumber(earnPosition.index),
      nftID: earnPosition.nftID || null,
    }
  }

  return {
    lps: zero,
    priceIndex: null,
    nftID: null,
  }
}
