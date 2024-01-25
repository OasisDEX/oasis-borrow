import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type {
  AaveCumulativeData,
  AaveHistoryEvent,
} from 'features/omni-kit/protocols/aave/history/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

const sumStringNumbersArray = (numbersArray: { amount: string }[]): BigNumber =>
  numbersArray
    .map(({ amount }: { amount: string }) => new BigNumber(amount))
    .reduce((acc, curr) => {
      return new BigNumber(acc).plus(curr)
    }, new BigNumber(0))

export async function getAaveHistoryEvents(
  _proxyAdrress: string,
  _networkId: NetworkIds,
): Promise<{
  events: AaveHistoryEvent[]
  positionCumulatives?: AaveCumulativeData
}> {
  const resposne = await loadSubgraph('Aave', 'getAaveHistory', _networkId, {
    dpmProxyAddress: _proxyAdrress,
  })

  if (resposne.success) {
    const { positionEvents, positions } = resposne.response
    return {
      events: positionEvents
        .map(
          (event): AaveHistoryEvent => ({
            depositAmount: event.depositTransfers[0]
              ? sumStringNumbersArray(event.depositTransfers)
              : zero,
            withdrawAmount: event.withdrawTransfers[0]
              ? sumStringNumbersArray(event.withdrawTransfers)
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
        // Ajna & Morpho have additional mapping later (mapLendingEvents.ts), so there is no issue with
        // overlapping events from different protocols. Aave & Spark doesn't so this one-liner will do the job
        // until we will rewrite it to omni-kit
        .filter((item) => !item.kind.includes('Ajna'))
        .sort((a, b) => b.timestamp - a.timestamp),
      positionCumulatives: positions[0]
        ? {
            cumulativeDepositUSD: new BigNumber(positions[0].cumulativeDepositUSD),
            cumulativeDepositInQuoteToken: new BigNumber(
              positions[0].cumulativeDepositInQuoteToken,
            ),
            cumulativeDepositInCollateralToken: new BigNumber(
              positions[0].cumulativeDepositInCollateralToken,
            ),
            cumulativeWithdrawUSD: new BigNumber(positions[0].cumulativeWithdrawUSD),
            cumulativeWithdrawInQuoteToken: new BigNumber(
              positions[0].cumulativeWithdrawInQuoteToken,
            ),
            cumulativeWithdrawInCollateralToken: new BigNumber(
              positions[0].cumulativeWithdrawInCollateralToken,
            ),
            cumulativeFeesUSD: new BigNumber(positions[0].cumulativeFeesUSD),
            cumulativeFeesInQuoteToken: new BigNumber(positions[0].cumulativeFeesInQuoteToken),
            cumulativeFeesInCollateralToken: new BigNumber(
              positions[0].cumulativeFeesInCollateralToken,
            ),
          }
        : undefined,
    }
  }

  return {
    events: [],
  }
}
