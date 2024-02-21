import type { TriggerType } from '@oasisdex/automation'
import type { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.constants'
import type { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.constants'
import type { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'

import type {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
} from './state/autoBSFormChange.constants'

export enum AutomationFeatures {
  AUTO_BUY = 'autoBuy',
  AUTO_SELL = 'autoSell',
  CONSTANT_MULTIPLE = 'constantMultiple',
  STOP_LOSS = 'stopLoss',
  TRAILING_STOP_LOSS = 'trailingStopLoss',
  AUTO_TAKE_PROFIT = 'autoTakeProfit',
}

export enum AutomationKinds {
  AUTO_BUY = 'auto-buy',
  AUTO_SELL = 'auto-sell',
  STOP_LOSS = 'stop-loss',
  AUTO_TAKE_PROFIT = 'auto-take-profit',
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
  | 'addAutoTakeProfit'
  | 'cancelAutoTakeProfit'
  | 'editAutoTakeProfit'

export type SidebarAutomationStages =
  | 'txSuccess'
  | 'txFailure'
  | 'txInProgress'
  | 'editing'
  | 'stopLossEditing'
  | 'isConfirming'

export interface AutomationSidebarCopiesParams {
  stage: SidebarAutomationStages
  flow: SidebarAutomationFlow
  feature: AutomationFeatures
  isAwaitingConfirmation?: boolean
  isRemoveForm?: boolean
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
  | typeof AUTO_TAKE_PROFIT_FORM_CHANGE

export type AutoBSTriggerTypes = TriggerType.BasicBuy | TriggerType.BasicSell
