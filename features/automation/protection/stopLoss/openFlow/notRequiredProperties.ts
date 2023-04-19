import { AutomationBotV2AddTriggerData } from 'blockchain/calls/automationBot'
import { AutomationBotRemoveTriggersData } from 'blockchain/calls/automationBotAggregator'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import {
  AutomationCommonData,
  AutomationContextProviderProps,
  AutomationPositionData,
} from 'components/AutomationContextProvider'
import { AutomationAddTriggerData } from 'features/automation/common/txDefinitions'
import { AutomationContracts, StopLossMetadata } from 'features/automation/metadata/types'
import { StopLossResetData } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { zero } from 'helpers/zero'

/*
 * This file contains definitions of constants that are required for automation
 * metadata interface but are not required during open position flow. You can use
 * it to mock required properties and ensure type safety.
 * */

export const notRequiredMethods: Pick<
  StopLossMetadata['methods'],
  'getExecutionPrice' | 'prepareAddStopLossTriggerData'
> = {
  getExecutionPrice: () => zero,
  prepareAddStopLossTriggerData: () => ({} as AutomationAddTriggerData),
}

export const notRequiredAaveTranslations: Pick<
  StopLossMetadata['translations'],
  'stopLossLevelCardFootnoteKey' | 'bannerStrategiesKey'
> = {
  stopLossLevelCardFootnoteKey: '',
  bannerStrategiesKey: '',
}

export const notRequiredValidations: Pick<
  StopLossMetadata['validation'],
  'getAddErrors' | 'getAddWarnings' | 'cancelErrors' | 'cancelWarnings'
> = {
  getAddErrors: () => ({}),
  getAddWarnings: () => ({}),
  cancelErrors: [],
  cancelWarnings: [],
}

export const notRequiredValues: Pick<
  StopLossMetadata['values'],
  'initialSlRatioWhenTriggerDoesntExist' | 'removeTxData' | 'resetData'
> = {
  initialSlRatioWhenTriggerDoesntExist: zero,

  removeTxData: {} as AutomationBotRemoveTriggersData,
  resetData: {} as StopLossResetData,
}

export const notRequiredContracts: AutomationContracts = {
  addTrigger: {} as TransactionDef<AutomationBotV2AddTriggerData>,
  removeTrigger: {} as TransactionDef<AutomationBotRemoveTriggersData>,
}

export const notRequiredPositionData: Pick<
  AutomationPositionData,
  | 'owner'
  | 'nextPositionRatio'
  | 'debtFloor'
  | 'debtOffset'
  | 'liquidationRatio'
  | 'liquidationPenalty'
  | 'liquidationPrice'
  | 'lockedCollateral'
  | 'vaultType'
> = {
  owner: '',
  nextPositionRatio: zero,
  debtFloor: zero,
  debtOffset: zero,
  liquidationPenalty: zero,
  liquidationPrice: zero,
  liquidationRatio: zero,
  lockedCollateral: zero,
  vaultType: '' as VaultType,
}

export const notRequiredCommonData: AutomationCommonData = {
  controller: '',
  nextCollateralPrice: zero,
  token: '',
}

export const notRequiredAutomationContext: Pick<
  AutomationContextProviderProps,
  'protocol' | 'commonData'
> = {
  protocol: '' as unknown as VaultProtocol,
  commonData: notRequiredCommonData,
}

export const notRequiredStopLossMetadata: Pick<StopLossMetadata, 'stopLossWriteEnabled'> = {
  stopLossWriteEnabled: false,
}
