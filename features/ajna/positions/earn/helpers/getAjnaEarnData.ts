import { GetEarnData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

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
        cumulativeDeposit: new BigNumber(earnPosition.account.cumulativeDeposit),
        cumulativeFees: new BigNumber(earnPosition.account.cumulativeFees),
        cumulativeWithdraw: new BigNumber(earnPosition.account.cumulativeWithdraw),
      }
  }

  return {
    lps: zero,
    priceIndex: null,
    nftID: null,
    cumulativeDeposit: zero,
    cumulativeFees: zero,
    cumulativeWithdraw: zero,
  }
}
