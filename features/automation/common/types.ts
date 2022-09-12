export enum AutomationFeatures {
  AUTO_BUY = 'Auto-Buy',
  AUTO_SELL = 'Auto-Sell',
  CONSTANT_MULTIPLE = 'Constant Multiple',
  STOP_LOSS = 'Stop-Loss Protection',
}

export type SidebarAutomationFlow =
  | 'addSl'
  | 'adjustSl'
  | 'cancelSl'
  | 'addBasicSell'
  | 'cancelBasicSell'
  | 'editBasicSell'
  | 'addBasicBuy'
  | 'cancelBasicBuy'
  | 'editBasicBuy'
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
