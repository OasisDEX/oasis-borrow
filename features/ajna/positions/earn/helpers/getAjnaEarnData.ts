import BigNumber from 'bignumber.js'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

import { GetEarnData } from '@oasisdex/oasis-actions-poc/src/views/ajna'

export const getAjnaEarnData: GetEarnData = async (proxy: string) => {
  const { response } = await loadSubgraph('Ajna', 'getEarnData', {
    dpmProxyAddress: proxy.toLowerCase(),
  })

  if (response && 'account' in response && response.account) {
    const earnPosition = response.account.earnPositions.find((position) => position.lps > 0)

    if (earnPosition)
      return {
        lps: new BigNumber(earnPosition.lps),
        priceIndex: new BigNumber(earnPosition.index),
        nftID: earnPosition.nft?.id || null,
      }
  }

  return {
    lps: zero,
    priceIndex: null,
    nftID: null,
  }
}
