import { TriggerType } from '@oasisdex/automation'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
} from 'features/automation/common/state/autoBSFormChange'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange'

export enum AutomationFeatures {
  AUTO_BUY = 'Auto-Buy',
  AUTO_SELL = 'Auto-Sell',
  CONSTANT_MULTIPLE = 'Constant Multiple',
  STOP_LOSS = 'Stop-Loss Protection',
}

export type SidebarAutomationFlow =
  | 'addSl'
  | 'editSl'
  | 'cancelSl'
  | 'addAutoSell'
  | 'cancelAutoSell'
  | 'editAutoSell'
  | 'addAutoBuy'
  | 'cancelAutoBuy'
  | 'editAutoBuy'
  | 'addConstantMultiple'
  | 'cancelConstantMultiple'
  | 'editConstantMultiple'

export type SidebarAutomationStages =
  | 'txSuccess'
  | 'txFailure'
  | 'txInProgress'
  | 'editing'
  | 'stopLossEditing'

export interface AutomationSidebarCopiesParams {
  stage: SidebarAutomationStages
  flow: SidebarAutomationFlow
  feature: AutomationFeatures
}

export interface AutomationSidebarStatusParams {
  stage: SidebarAutomationStages
  flow: SidebarAutomationFlow
  feature: AutomationFeatures
  txHash?: string
  etherscan?: string
}

export type AutomationBSPublishType = typeof AUTO_SELL_FORM_CHANGE | typeof AUTO_BUY_FORM_CHANGE

export type AutomationPublishType =
  | AutomationBSPublishType
  | typeof CONSTANT_MULTIPLE_FORM_CHANGE
  | typeof STOP_LOSS_FORM_CHANGE

export type AutoBSTriggerTypes = TriggerType.BasicBuy | TriggerType.BasicSell
