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
  ],
  autoSell: [
    TriggerType.BasicSell,
    TriggerType.MakerBasicSellV2,
    TriggerType.SimpleAAVESell,
    TriggerType.DmaAaveBasicSellV2,
    TriggerType.DmaSparkBasicSellV2,
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
  ],
  takeProfit: [
    TriggerType.AutoTakeProfitToCollateral,
    TriggerType.AutoTakeProfitToDai,
    TriggerType.MakerAutoTakeProfitToCollateralV2,
    TriggerType.MakerAutoTakeProfitToDaiV2,
  ],
}

export function getPositionsAutomations({
  triggers,
  defaultList = {},
}: GetPositionsAutomationsParams): PortfolioPositionAutomations {
  return triggers.reduce((automations, { triggerType }) => {
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
