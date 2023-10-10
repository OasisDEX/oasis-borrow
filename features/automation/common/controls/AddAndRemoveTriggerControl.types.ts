import type { AutoBSTriggerResetData } from 'features/automation/common/state/autoBSFormChange.types'
import type { AutomationTxHandlerAnalytics } from 'features/automation/common/state/automationFeatureTxHandlers'
import type {
  AutomationAddTriggerData,
  AutomationRemoveTriggerData,
} from 'features/automation/common/txDefinitions.types'
import type {
  AutomationPublishType,
  SidebarAutomationStages,
} from 'features/automation/common/types'
import type { AutomationContracts } from 'features/automation/metadata/types'
import type { AutoTakeProfitResetData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.types'
import type { StopLossResetData } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { ReactElement } from 'react'

export interface AddAndRemoveTxHandler {
  callOnSuccess?: () => void
}
export interface AddAndRemoveTriggerControlProps {
  addTxData: AutomationAddTriggerData
  removeTxData?: AutomationRemoveTriggerData
  isActiveFlag: boolean
  isAddForm: boolean
  isEditing: boolean
  isRemoveForm: boolean
  publishType: AutomationPublishType
  resetData: StopLossResetData | AutoTakeProfitResetData | AutoBSTriggerResetData
  shouldRemoveAllowance: boolean
  stage: SidebarAutomationStages
  textButtonHandlerExtension?: () => void
  triggersId: number[]
  txHelpers?: TxHelpers
  children: (
    txHandler: (options?: AddAndRemoveTxHandler) => void,
    textButtonHandler: () => void,
  ) => ReactElement
  analytics: AutomationTxHandlerAnalytics
  // TODO contracts prop is optional until we will have metadata for all auto features
  contracts?: AutomationContracts
}
