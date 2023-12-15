import type { GetCumulativesData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export const getAjnaCumulatives: (networkId: NetworkIds) => GetCumulativesData =
  (networkId) => async (proxy: string, poolAddress: string) => {
    const { response } = (await loadSubgraph('Ajna', 'getAjnaCumulatives', networkId, {
      dpmProxyAddress: proxy.toLowerCase(),
      poolAddress: poolAddress.toLowerCase(),
    })) as SubgraphsResponses['Ajna']['getAjnaCumulatives']

    return {
      borrowCumulativeDepositUSD: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeDepositUSD || 0,
      ),
      borrowCumulativeWithdrawUSD: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeWithdrawUSD || 0,
      ),
      borrowCumulativeFeesUSD: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeFeesUSD || 0,
      ),
      borrowCumulativeCollateralDeposit: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeCollateralDeposit || 0,
      ),
      borrowCumulativeCollateralWithdraw: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeCollateralWithdraw || 0,
      ),
      earnCumulativeFeesInQuoteToken: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeFeesInQuoteToken || 0,
      ),
      earnCumulativeQuoteTokenDeposit: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeQuoteTokenDeposit || 0,
      ),
      earnCumulativeQuoteTokenWithdraw: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeQuoteTokenWithdraw || 0,
      ),
    }
  }
