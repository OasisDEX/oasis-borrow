import type { TriggerEvent } from 'features/positionHistory/types'

const triggerKindMap: Record<string, string> = {
  BasicBuy: 'basic-buy',
  BasicSell: 'basic-sell',
  StopLossToDai: 'stop-loss',
  StopLossToCollateral: 'stop-loss',
  AutoTakeProfitToDai: 'auto-take-profit',
  AutoTakeProfitToCollateral: 'auto-take-profit',
}

export const mapMakerSubgraphAutomationHistoryOld = (triggerEvents: TriggerEvent[]) => {
  return triggerEvents.map((event) => {
    const cpdIdIndex = event.trigger.decodedDataNames.findIndex((x) => x === 'cpdId')

    return {
      cdpId: event.trigger.decodedData[cpdIdIndex],
      chainId: 1,
      commandAddress: event.trigger.commandAddress,
      ethPrice: '1',
      eventType: event.eventType.toLowerCase(),
      gasFee: '0',
      hash: event.transaction,
      id: event.transaction,
      kind: triggerKindMap[event.trigger.kind],
      timestamp: Number(event.timestamp) * 1000,
      triggerData: event.trigger.triggerData,
      triggerId: event.trigger.id,
    }
  })
}
