import type {
  AutoBSMetadata,
  AutomationDefinitionMetadata,
  AutoTakeProfitMetadata,
  ContextWithoutMetadata,
  GetAutomationMetadata,
  StopLossMetadata,
} from 'features/automation/metadata/types'

function getDefaultMetadataWithDefault<T>(featureFn?: GetAutomationMetadata<T>) {
  return featureFn || ((() => ({})) as unknown as GetAutomationMetadata<T>)
}

export function initializeMetadata({
  automationContext,
  metadata,
}: {
  automationContext: ContextWithoutMetadata
  metadata: AutomationDefinitionMetadata
}) {
  const { autoTakeProfit, autoBuy, autoSell, stopLoss } = metadata

  return {
    autoBuyMetadata: getDefaultMetadataWithDefault<AutoBSMetadata>(autoBuy)(automationContext),
    autoSellMetadata: getDefaultMetadataWithDefault<AutoBSMetadata>(autoSell)(automationContext),
    autoTakeProfitMetadata:
      getDefaultMetadataWithDefault<AutoTakeProfitMetadata>(autoTakeProfit)(automationContext),
    stopLossMetadata: getDefaultMetadataWithDefault<StopLossMetadata>(stopLoss)(automationContext),
  }
}
