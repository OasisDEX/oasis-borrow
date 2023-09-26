import { autoBSFormChangeReducer } from 'features/automation/common/state/autoBSFormChange'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
} from 'features/automation/common/state/autoBSFormChange.constants'
import { automationChangeFeatureReducer } from 'features/automation/common/state/automationFeatureChange'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import { autoTakeProfitFormChangeReducer } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.constants'
import { constantMultipleFormChangeReducer } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.constants'
import { multiplyPillChangeReducer } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange'
import { MULTIPLY_VAULT_PILL_CHANGE_SUBJECT } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange.constants'
import { formChangeReducer } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'
import {
  FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE,
  followedVaultsLimitReachedChangeReducer,
} from 'features/follow/common/followedVaultsLimitReached'
import { tabChangeReducer } from 'features/generalManageVault/TabChange'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange.constants'
import { NOTIFICATION_CHANGE, notificationReducer } from 'features/notifications/notificationChange'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  swapWidgetChangeReducer,
} from 'features/swapWidget/SwapWidgetChange'
import { gasEstimationReducer } from 'helpers/gasEstimate'

import { TX_DATA_CHANGE } from './gasEstimate.constants'
import { createUIChangesSubject } from './uiChanges.createUIChangesSubject'

function initializeUIChanges() {
  const uiChangesSubject = createUIChangesSubject()

  uiChangesSubject.configureSubject(STOP_LOSS_FORM_CHANGE, formChangeReducer)
  uiChangesSubject.configureSubject(AUTO_SELL_FORM_CHANGE, autoBSFormChangeReducer)
  uiChangesSubject.configureSubject(AUTO_BUY_FORM_CHANGE, autoBSFormChangeReducer)
  uiChangesSubject.configureSubject(TAB_CHANGE_SUBJECT, tabChangeReducer)
  uiChangesSubject.configureSubject(MULTIPLY_VAULT_PILL_CHANGE_SUBJECT, multiplyPillChangeReducer)
  uiChangesSubject.configureSubject(SWAP_WIDGET_CHANGE_SUBJECT, swapWidgetChangeReducer)
  uiChangesSubject.configureSubject(AUTOMATION_CHANGE_FEATURE, automationChangeFeatureReducer)
  uiChangesSubject.configureSubject(
    CONSTANT_MULTIPLE_FORM_CHANGE,
    constantMultipleFormChangeReducer,
  )
  uiChangesSubject.configureSubject(NOTIFICATION_CHANGE, notificationReducer)
  uiChangesSubject.configureSubject(TX_DATA_CHANGE, gasEstimationReducer)
  uiChangesSubject.configureSubject(AUTO_TAKE_PROFIT_FORM_CHANGE, autoTakeProfitFormChangeReducer)
  uiChangesSubject.configureSubject(
    FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE,
    followedVaultsLimitReachedChangeReducer,
  )
  return uiChangesSubject
}

export const uiChanges = initializeUIChanges()
