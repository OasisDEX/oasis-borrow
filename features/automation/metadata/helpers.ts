import {
  AutomationDefinitionMetadata,
  AutomationMetadata,
  ContextWithoutMetadata,
} from 'features/automation/metadata/types'

const defaultMetadata = {
  autoBuy: (_) => ({}),
  autoSell: (_) => ({}),
  autoTakeProfit: (_) => ({}),
  constantMultiple: (_) => ({}),
  stopLoss: (_) => ({}),
} as AutomationMetadata

export function initializeMetadata({
  automationContext,
  metadata,
}: {
  automationContext: ContextWithoutMetadata
  metadata: AutomationDefinitionMetadata
}) {
  const { autoTakeProfit, autoBuy, autoSell, constantMultiple, stopLoss } = metadata

  const autoBuyMethod = autoBuy || defaultMetadata.autoBuy
  const autoSellMethod = autoSell || defaultMetadata.autoSell
  const autoTakeProfitMethod = autoTakeProfit || defaultMetadata.autoTakeProfit
  const constantMultipleMethod = constantMultiple || defaultMetadata.constantMultiple
  const stopLossMethod = stopLoss || defaultMetadata.stopLoss

  return {
    autoBuy: autoBuyMethod(automationContext),
    autoSell: autoSellMethod(automationContext),
    autoTakeProfit: autoTakeProfitMethod(automationContext),
    constantMultiple: constantMultipleMethod(automationContext),
    stopLoss: stopLossMethod(automationContext),
  }
}
