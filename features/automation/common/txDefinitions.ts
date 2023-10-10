import { addAutomationBotTrigger } from 'blockchain/calls/automationBot.constants'
import { addAutomationBotAggregatorTrigger } from 'blockchain/calls/automationBotAggregator.constants'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.constants'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.constants'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'

import { AUTO_BUY_FORM_CHANGE, AUTO_SELL_FORM_CHANGE } from './state/autoBSFormChange.constants'

export const addTransactionMap = {
  [CONSTANT_MULTIPLE_FORM_CHANGE]: addAutomationBotAggregatorTrigger,
  [AUTO_BUY_FORM_CHANGE]: addAutomationBotTrigger,
  [AUTO_SELL_FORM_CHANGE]: addAutomationBotTrigger,
  [STOP_LOSS_FORM_CHANGE]: addAutomationBotTrigger,
  [AUTO_TAKE_PROFIT_FORM_CHANGE]: addAutomationBotTrigger,
}
