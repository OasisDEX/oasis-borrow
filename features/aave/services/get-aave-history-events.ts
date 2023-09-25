import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { AaveHistoryEvent } from 'features/ajna/history/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

export async function getAaveHistoryEvents(
  _proxyAdrress: string,
  _networkId: NetworkIds,
): Promise<AaveHistoryEvent[]> {
  const resposne = await loadSubgraph('Aave', 'getAaveHistory', _networkId, {
    dpmProxyAddress: _proxyAdrress,
  })

  if (resposne.success) {
    return resposne.response.positionEvents
      .map(
        (event): AaveHistoryEvent => ({
          depositAmount: event.depositTransfers[0]
            ? new BigNumber(event.depositTransfers[0].amount)
            : zero,
          withdrawAmount: event.withdrawTransfers[0]
            ? new BigNumber(event.withdrawTransfers[0].amount)
            : zero,
          blockNumber: new BigNumber(event.blockNumber),
          collateralAddress: event.collateralAddress,
          collateralAfter: new BigNumber(event.collateralAfter),
          collateralBefore: new BigNumber(event.collateralBefore),
          collateralDelta: new BigNumber(event.collateralDelta),
          collateralOraclePrice: new BigNumber(event.collateralOraclePrice),
          collateralToken: event.collateralToken.symbol,
          collateralTokenPriceUSD: new BigNumber(event.collateralTokenPriceUSD),
          debtAddress: event.debtAddress,
          debtAfter: new BigNumber(event.debtAfter),
          debtBefore: new BigNumber(event.debtBefore),
          debtDelta: new BigNumber(event.debtDelta),
          debtOraclePrice: new BigNumber(event.debtOraclePrice),
          debtToken: event.debtToken.symbol,
          debtTokenPriceUSD: new BigNumber(event.debtTokenPriceUSD),
          depositedUSD: new BigNumber(event.depositedUSD),
          ethPrice: new BigNumber(event.ethPrice),
          gasFeeUSD: new BigNumber(event.gasFeeUSD),
          gasPrice: new BigNumber(event.gasPrice),
          gasUsed: new BigNumber(event.gasUsed),
          id: event.id,
          kind: event.kind,
          liquidationPriceAfter: new BigNumber(event.liquidationPriceAfter),
          liquidationPriceBefore: new BigNumber(event.liquidationPriceBefore),
          ltvAfter: new BigNumber(event.ltvAfter),
          ltvBefore: new BigNumber(event.ltvBefore),
          marketPrice: new BigNumber(event.marketPrice),
          multipleAfter: new BigNumber(event.multipleAfter),
          multipleBefore: new BigNumber(event.multipleBefore),
          netValueAfter: new BigNumber(event.netValueAfter),
          netValueBefore: new BigNumber(event.netValueBefore),
          oasisFee: new BigNumber(event.summerFee),
          oasisFeeToken: event.summerFeeToken,
          oasisFeeUSD: new BigNumber(event.summerFeeUSD),
          isOpen: event.kind === 'AAVEOpenDepositBorrow' || event.kind === 'OpenAAVEPosition',
          swapFromAmount: new BigNumber(event.swapFromAmount),
          swapFromToken: event.swapFromToken,
          swapToAmount: new BigNumber(event.swapToAmount),
          swapToToken: event.swapToToken,
          timestamp: Number(event.timestamp) * 1000,
          totalFee: new BigNumber(event.totalFee),
          txHash: event.txHash,
          withdrawnUSD: new BigNumber(event.withdrawnUSD),
          trigger: event.trigger ?? undefined,
        }),
      )
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  return []
}
