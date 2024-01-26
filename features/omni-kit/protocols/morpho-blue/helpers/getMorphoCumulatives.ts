import type { GetCumulativesData, MorphoCumulativesData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export const getMorphoCumulatives: (
  networkId: OmniSupportedNetworkIds,
) => GetCumulativesData<MorphoCumulativesData> =
  (networkId) => async (proxy: string, marketId: string) => {
    console.trace('HEEERE', {
      proxy,
      marketId,
    })
    const { response } = (await loadSubgraph('Morpho', 'getMorphoCumulatives', networkId, {
      dpmProxyAddress: proxy.toLowerCase(),
      marketId: marketId.toLowerCase(),
    })) as SubgraphsResponses['Morpho']['getMorphoCumulatives']
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
    }
  }
