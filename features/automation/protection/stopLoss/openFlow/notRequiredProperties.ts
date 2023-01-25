import { VaultType } from '@prisma/client'
import { AutomationBotV2AddTriggerData } from 'blockchain/calls/automationBot'
import { AutomationBotRemoveTriggersData } from 'blockchain/calls/automationBotAggregator'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { AutomationAddTriggerData } from 'features/automation/common/txDefinitions'
import { StopLossResetData } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { zero } from 'helpers/zero'

/*
 * This file contains definitions of constants that are required for automation
 * metadata interface but are not required during open position flow. You can use
 * it to mock required properties and ensure type safety.
 * */

export const notRequiredMethods = {
  getExecutionPrice: () => zero,
  prepareAddStopLossTriggerData: () => ({} as AutomationAddTriggerData),
}

export const notRequiredAaveTranslations = {
  stopLossLevelCardFootnoteKey: '',
  bannerStrategiesKey: '',
}

export const notRequiredValidations = {
  getAddErrors: () => ({}),
  getAddWarnings: () => ({}),
  cancelErrors: [],
  cancelWarnings: [],
}

export const notRequiredValues = {
  initialSlRatioWhenTriggerDoesntExist: zero,
  triggerMaxToken: zero,
  dynamicStopLossPrice: zero,
  removeTxData: {} as AutomationBotRemoveTriggersData,
  resetData: {} as StopLossResetData,
}

export const notRequiredContracts = {
  addTrigger: {} as TransactionDef<AutomationBotV2AddTriggerData>,
  removeTrigger: {} as TransactionDef<AutomationBotRemoveTriggersData>,
}

export const notRequiredPositionData = {
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

export const notRequiredCommonData = {
  controller: '',
  nextCollateralPrice: zero,
  token: '',
}

export const notRequiredAutomationContext = {
  protocol: ('' as unknown) as VaultProtocol,
  commonData: notRequiredCommonData,
}
