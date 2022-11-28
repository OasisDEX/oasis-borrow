import {
  AutoBSMetadata,
  AutomationDefinitionMetadata,
  AutoTakeProfitMetadata,
  ConstantMultipleMetadata,
  ContextWithoutMetadata,
  GetAutomationMetadata,
  StopLossMetadata,
} from 'features/automation/metadata/types'

function getDefaultMetadataWithDefault<T>(featureFn?: GetAutomationMetadata<T>) {
  return featureFn || (((() => ({})) as unknown) as GetAutomationMetadata<T>)
}

export function initializeMetadata({
  automationContext,
  metadata,
}: {
  automationContext: ContextWithoutMetadata
  metadata: AutomationDefinitionMetadata
}) {
  const { autoTakeProfit, autoBuy, autoSell, constantMultiple, stopLoss } = metadata

  return {
    autoBuy: getDefaultMetadataWithDefault<AutoBSMetadata>(autoBuy)(automationContext),
    autoSell: getDefaultMetadataWithDefault<AutoBSMetadata>(autoSell)(automationContext),
    autoTakeProfit: getDefaultMetadataWithDefault<AutoTakeProfitMetadata>(autoTakeProfit)(
      automationContext,
    ),
    constantMultiple: getDefaultMetadataWithDefault<ConstantMultipleMetadata>(constantMultiple)(
      automationContext,
    ),
    stopLoss: getDefaultMetadataWithDefault<StopLossMetadata>(stopLoss)(automationContext),
  }
}
