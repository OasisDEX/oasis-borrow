import BigNumber from 'bignumber.js'
import { mapPositionHistoryResponse } from 'features/positionHistory/mapPositionHistoryResponse'
import { PositionHistoryEvent, PositionHistoryResponse } from 'features/positionHistory/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface AjnaHistoryResponse extends PositionHistoryResponse {
  originationFee: string
}

export interface AjnaHistoryEvent extends PositionHistoryEvent {
  originationFee: BigNumber
}

export type AjnaHistoryEvents = AjnaHistoryEvent[]

type GetAjnaHistory = (dpmProxyAddress: string) => Promise<AjnaHistoryEvents>

export const getAjnaHistory: GetAjnaHistory = async (dpmProxyAddress: string) => {
  const { response } = await loadSubgraph('Ajna', 'getHistory', {
    dpmProxyAddress: dpmProxyAddress.toLowerCase(),
  })

  if (response && 'oasisEvents' in response) {
    return response.oasisEvents
      .map((event) => ({
        originationFee: new BigNumber(event.originationFee),
        ...mapPositionHistoryResponse(event),
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  throw new Error('No history data found')
}

// TODO to be removed when implementing aave history, dummy aave history interface
export interface AaveHistoryEvent extends PositionHistoryEvent {
  aaveStuff: BigNumber
}
