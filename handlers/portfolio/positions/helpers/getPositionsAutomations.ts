import { TriggerType } from '@oasisdex/automation'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import type { PortfolioPositionAutomations } from 'handlers/portfolio/types'

interface GetPositionsAutomationsParams {
  triggers: AutomationResponse[number]['triggers'][]
  defaultList?: Record<string, boolean> | {}
}

const triggerTypesMap = {
  autoBuy: [
    TriggerType.BasicBuy,
    TriggerType.MakerBasicBuyV2,
    TriggerType.DmaAaveBasicBuyV2,
    TriggerType.DmaSparkBasicBuyV2,
    TriggerType.DmaMorphoBlueBasicBuyV2,
  ],
  autoSell: [
    TriggerType.BasicSell,
    TriggerType.MakerBasicSellV2,
    TriggerType.SimpleAAVESell,
    TriggerType.DmaAaveBasicSellV2,
    TriggerType.DmaSparkBasicSellV2,
    TriggerType.DmaMorphoBlueBasicSellV2,
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
    TriggerType.DmaAaveTrailingStopLossV2,
    TriggerType.DmaSparkTrailingStopLossV2,
    116, // legacy + unused: spark stop loss to debt
    119, // legacy + unused: aave stop loss to debt
    123, // legacy: aave stop loss to collateral
    124, // legacy: aave stop loss to debt
    125, // legacy: spark stop loss to collateral
    126, // legacy: spark stop loss to debt
    TriggerType.DmaMorphoBlueStopLossV2,
    TriggerType.DmaMorphoBlueTrailingStopLossV2,
  ],
  takeProfit: [
    TriggerType.AutoTakeProfitToCollateral,
    TriggerType.AutoTakeProfitToDai,
    TriggerType.MakerAutoTakeProfitToCollateralV2,
    TriggerType.MakerAutoTakeProfitToDaiV2,
    TriggerType.DmaAavePartialTakeProfitV2,
    TriggerType.DmaSparkPartialTakeProfitV2,
    TriggerType.DmaMorphoBluePartialTakeProfitV2,
  ],
}

export function getPositionsAutomations({
  triggers,
  defaultList = {},
}: GetPositionsAutomationsParams): PortfolioPositionAutomations {
  return triggers
    .filter((trigger) => {
      // we've been filtering all executedBlock and removedBlock
      // Auto Buy/Sell and Take profit are recurring triggers
      // so it doesnt matter if they are executed or not
      // as long as they are not removed theyre enabled
      // so in this case im just filtering out executed stop loss like triggers
      if (
        !!trigger.executedBlock &&
        triggerTypesMap.stopLoss.includes(Number(trigger.triggerType))
      ) {
        return false
      }
      return trigger
    })
    .filter(Boolean)
    .reduce((automations, { triggerType }) => {
      return {
        ...automations,
        ...Object.keys(triggerTypesMap).reduce(
          (result, key) => ({
            ...result,
            ...(triggerTypesMap[key as keyof typeof triggerTypesMap].includes(
              Number(triggerType),
            ) && {
              [key]: { enabled: true },
            }),
          }),
          {},
        ),
      }
    }, defaultList)
}
