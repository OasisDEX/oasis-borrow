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
      borrowCumulativeDepositInQuoteToken: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeDepositInQuoteToken || 0,
      ),
      borrowCumulativeDepositInCollateralToken: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeDepositInCollateralToken || 0,
      ),
      borrowCumulativeWithdrawUSD: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeWithdrawUSD || 0,
      ),
      borrowCumulativeWithdrawInQuoteToken: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeWithdrawInQuoteToken || 0,
      ),
      borrowCumulativeWithdrawInCollateralToken: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeWithdrawInCollateralToken || 0,
      ),
      borrowCumulativeCollateralDeposit: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeCollateralDeposit || 0,
      ),
      borrowCumulativeCollateralWithdraw: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeCollateralWithdraw || 0,
      ),
      borrowCumulativeDebtDeposit: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeDebtDeposit || 0,
      ),
      borrowCumulativeDebtWithdraw: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeDebtWithdraw || 0,
      ),
      borrowCumulativeFeesUSD: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeFeesUSD || 0,
      ),
      borrowCumulativeFeesInQuoteToken: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeFeesInQuoteToken || 0,
      ),
      borrowCumulativeFeesInCollateralToken: new BigNumber(
        response.account?.borrowPositions[0]?.borrowCumulativeFeesInCollateralToken || 0,
      ),
      earnCumulativeDepositUSD: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeDepositUSD || 0,
      ),
      earnCumulativeDepositInQuoteToken: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeDepositInQuoteToken || 0,
      ),
      earnCumulativeDepositInCollateralToken: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeDepositInCollateralToken || 0,
      ),
      earnCumulativeWithdrawUSD: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeWithdrawUSD || 0,
      ),
      earnCumulativeWithdrawInQuoteToken: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeWithdrawInQuoteToken || 0,
      ),
      earnCumulativeWithdrawInCollateralToken: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeWithdrawInCollateralToken || 0,
      ),
      earnCumulativeFeesUSD: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeFeesUSD || 0,
      ),
      earnCumulativeFeesInQuoteToken: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeFeesInQuoteToken || 0,
      ),
      earnCumulativeFeesInCollateralToken: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeFeesInCollateralToken || 0,
      ),
      earnCumulativeQuoteTokenDeposit: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeQuoteTokenDeposit || 0,
      ),
      earnCumulativeQuoteTokenWithdraw: new BigNumber(
        response.account?.earnPositions[0]?.earnCumulativeQuoteTokenWithdraw || 0,
      ),
    }
  }
