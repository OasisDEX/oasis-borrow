import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { erc2626DefaultHistoryEvent } from 'features/omni-kit/protocols/erc-4626/history/erc2626DefaultHistoryEvent'
import type {
  Erc4626EarnEventResponse,
  Erc4626HistoryEvent,
} from 'features/omni-kit/protocols/erc-4626/history/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface Erc4626PositionAggregatedData {
  history: Erc4626HistoryEvent[]
}

const mapEvent = (event: Erc4626EarnEventResponse) => {
  return {
    ...event,
    blockNumber: new BigNumber(event.blockNumber),
    kind: event.kind,
    timestamp: Number(event.timestamp) * 1000,
    txHash: event.txHash,
    quoteToken: event.quoteToken.symbol.toUpperCase(),
    quoteTokensPriceUSD: new BigNumber(event.quoteTokenPriceUSD),
    quoteTokensAfter: new BigNumber(event.quoteAfter),
    quoteTokensBefore: new BigNumber(event.quoteBefore),
    quoteTokensDelta: new BigNumber(event.quoteDelta),
    swapFromAmount: new BigNumber(event.swapFromAmount),
    depositedUSD: new BigNumber(event.depositedUSD),
    withdrawnUSD: new BigNumber(event.withdrawnUSD),
    ethPrice: new BigNumber(event.ethPrice),
    gasFeeUSD: new BigNumber(event.gasFeeUSD),
    gasPrice: new BigNumber(event.gasPrice),
    gasUsed: new BigNumber(event.gasUsed),
    marketPrice: new BigNumber(event.marketPrice),
    oasisFee: new BigNumber(event.oasisFee),
    oasisFeeUSD: new BigNumber(event.oasisFeeUSD),
    swapToAmount: new BigNumber(event.swapToAmount),
    totalFee: new BigNumber(event.totalFee),
    withdrawTransfers: event.withdrawTransfers.map((transfer) => ({
      ...transfer,
      amount: new BigNumber(transfer.amount),
      amountUSD: new BigNumber(transfer.amountUSD),
    })),
  }
}

export async function getErc4626PositionAggregatedData(
  networkId: NetworkIds,
  vaultAddress: string,
  dpmProxyAddress: string,
): Promise<Erc4626PositionAggregatedData> {
  const { response } = (await loadSubgraph({
    subgraph: 'Erc4626',
    method: 'getErc4626PositionAggregatedData',
    networkId,
    params: {
      dpmProxyAddress: dpmProxyAddress.toLowerCase(),
      vault: vaultAddress.toLowerCase(),
    },
  })) as SubgraphsResponses['Erc4626']['getErc4626PositionAggregatedData']

  if (response.summerEvents.length === 0) {
    return {
      history: [],
    }
  }

  return {
    history: response.summerEvents.map((event) => {
      return {
        ...erc2626DefaultHistoryEvent,
        ...mapEvent(event),
      }
    }),
  }
}
