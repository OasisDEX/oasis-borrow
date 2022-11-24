import {
  AutomationDefinitionMetadata,
  AutomationMetadata,
  ContextWithoutMetadata,
} from 'features/automation/metadata/types'

const defaultMetadata = {
  stopLoss: (_) => ({}),
  autoSell: (_) => ({}),
  autoBuy: (_) => ({}),
  constantMultiple: (_) => ({}),
  takeProfit: (_) => ({}),
} as AutomationMetadata

export function initializeMetadata(
  metadata: AutomationDefinitionMetadata,
  automationContext: ContextWithoutMetadata,
) {
  const { stopLoss, autoSell, autoBuy, constantMultiple, takeProfit } = metadata

  const stopLossMethod = stopLoss || defaultMetadata.stopLoss
  const autoSellMethod = autoSell || defaultMetadata.autoSell
  const autoBuyMethod = autoBuy || defaultMetadata.autoBuy
  const constantMultipleMethod = constantMultiple || defaultMetadata.constantMultiple
  const takeProfitMethod = takeProfit || defaultMetadata.takeProfit

  return {
    stopLoss: stopLossMethod(automationContext),
    autoSell: autoSellMethod(automationContext),
    autoBuy: autoBuyMethod(automationContext),
    constantMultiple: constantMultipleMethod(automationContext),
    takeProfit: takeProfitMethod(automationContext),
  }
}
