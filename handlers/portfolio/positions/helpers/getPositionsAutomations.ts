import { decodeTriggerDataAsJson, TriggerType } from '@oasisdex/automation'
import type { NetworkIds } from 'blockchain/networks'
import type { MakerDiscoverPositionsTrigger } from 'handlers/portfolio/positions/handlers/maker/types'
import type { PortfolioPositionAutomations } from 'handlers/portfolio/types'

interface getPositionsAutomationsParams {
  networkId: NetworkIds
  triggers: MakerDiscoverPositionsTrigger[]
}

const triggerTypesMap = {
  autoBuy: [TriggerType.BasicBuy, TriggerType.MakerBasicBuyV2, TriggerType.DmaAaveBasicBuyV2],
  autoSell: [
    TriggerType.BasicSell,
    TriggerType.MakerBasicSellV2,
    TriggerType.SimpleAAVESell,
    TriggerType.DmaAaveBasicSellV2,
  ],
  stopLoss: [
    TriggerType.AaveStopLossToCollateral,
    TriggerType.AaveStopLossToCollateralV2,
    TriggerType.AaveStopLossToDebt,
    TriggerType.AaveStopLossToDebtV2,
    TriggerType.MakerStopLossToCollateralV2,
    TriggerType.MakerStopLossToDaiV2,
    TriggerType.SparkStopLossToCollateralV2,
    TriggerType.SparkStopLossToDebtV2,
    TriggerType.StopLossToCollateral,
    TriggerType.StopLossToDai,
    TriggerType.DmaAaveStopLossToCollateralV2,
    TriggerType.DmaAaveStopLossToDebtV2,
    TriggerType.DmaSparkStopLossToCollateralV2,
    TriggerType.DmaSparkStopLossToDebtV2,
  ],
  takeProfit: [
    TriggerType.AutoTakeProfitToCollateral,
    TriggerType.AutoTakeProfitToDai,
    TriggerType.MakerAutoTakeProfitToCollateralV2,
    TriggerType.MakerAutoTakeProfitToDaiV2,
  ],
}

export function getPositionsAutomations({
  networkId,
  triggers,
}: getPositionsAutomationsParams): PortfolioPositionAutomations {
  return triggers
    .filter(({ executedBlock, removedBlock }) => executedBlock === null && removedBlock === null)
    .reduce((automations, { commandAddress, triggerData }) => {
      const decodedTrigger = decodeTriggerDataAsJson(commandAddress, networkId, triggerData)
      const triggerType = Number(
        'triggerType' in decodedTrigger ? decodedTrigger.triggerType : decodedTrigger,
      ) as TriggerType

      return {
        ...automations,
        ...Object.keys(triggerTypesMap).reduce(
          (result, key) => ({
            ...result,
            ...(triggerTypesMap[key as keyof typeof triggerTypesMap].includes(triggerType) && {
              [key]: { enabled: true },
            }),
          }),
          {},
        ),
      }
    }, {})
}
