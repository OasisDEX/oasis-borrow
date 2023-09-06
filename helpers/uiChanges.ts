import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
  AutoBSChangeAction,
  AutoBSFormChange,
  autoBSFormChangeReducer,
} from 'features/automation/common/state/autoBSFormChange'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
  AutomationChangeFeatureAction,
  automationChangeFeatureReducer,
} from 'features/automation/common/state/automationFeatureChange'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
  AutoTakeProfitFormChangeAction,
  autoTakeProfitFormChangeReducer,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleChangeAction,
  ConstantMultipleFormChange,
  constantMultipleFormChangeReducer,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import {
  MULTIPLY_VAULT_PILL_CHANGE_SUBJECT,
  MultiplyPillChange,
  MultiplyPillChangeAction,
  multiplyPillChangeReducer,
} from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange'
import {
  formChangeReducer,
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
  StopLossFormChangeAction,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE,
  FollowedVaultsLimitReachedChange,
  FollowedVaultsLimitReachedChangeAction,
  followedVaultsLimitReachedChangeReducer,
} from 'features/follow/common/followedVaultsLimitReached'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
  TabChangeAction,
  tabChangeReducer,
} from 'features/generalManageVault/TabChange'
import {
  NOTIFICATION_CHANGE,
  NotificationChange,
  NotificationChangeAction,
  notificationReducer,
} from 'features/notifications/notificationChange'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  swapWidgetChangeReducer,
  SwapWidgetState,
} from 'features/swapWidget/SwapWidgetChange'
import {
  gasEstimationReducer,
  TX_DATA_CHANGE,
  TxPayloadChange,
  TxPayloadChangeAction,
} from 'helpers/gasEstimate'
import { Observable, Subject } from 'rxjs'
import { filter, map, shareReplay } from 'rxjs/operators'

export type SupportedUIChangeType =
  | StopLossFormChange
  | AutoBSFormChange
  | ConstantMultipleFormChange
  | TabChange
  | MultiplyPillChange
  | SwapWidgetState
  | AutomationChangeFeature
  | NotificationChange
  | TxPayloadChange
  | AutoTakeProfitFormChange
  | FollowedVaultsLimitReachedChange

export type LegalUiChanges = {
  StopLossFormChange: StopLossFormChangeAction
  AutoBSChange: AutoBSChangeAction
  TabChange: TabChangeAction
  MultiplyPillChange: MultiplyPillChangeAction
  SwapWidgetChange: SwapWidgetChangeAction
  AutomationChangeFeature: AutomationChangeFeatureAction
  ConstantMultipleChangeAction: ConstantMultipleChangeAction
  NotificationChange: NotificationChangeAction
  TxPayloadChange: TxPayloadChangeAction
  AutoTakeProfitFormChange: AutoTakeProfitFormChangeAction
  FollowedVaultsLimitReachedChangeAction: FollowedVaultsLimitReachedChangeAction
}

export type ReducersMap = {
  [key: string]: UIReducer
}

export type UIChanges = {
  subscribe: <T extends SupportedUIChangeType>(sub: string) => Observable<T>
  publish: <K extends LegalUiChanges[keyof LegalUiChanges]>(sub: string, event: K) => void
  lastPayload: <T extends SupportedUIChangeType>(sub: string) => T
  clear: (sub: string) => void
  configureSubject: <
    T extends SupportedUIChangeType,
    K extends LegalUiChanges[keyof LegalUiChanges],
  >(
    subject: string,
    reducer: (prev: T, event: K) => T,
    initialState?: T,
  ) => void
}

export type UIReducer = (prev: any, event: any) => any

function createUIChangesSubject(): UIChanges {
  const latest: any = {}

  const reducers: ReducersMap = {} // TODO: Is there a way to strongly type this ?

  interface PublisherRecord {
    subjectName: string
    payload: SupportedUIChangeType
  }

  const commonSubject = new Subject<PublisherRecord>()

  function subscribe<T extends SupportedUIChangeType>(subjectName: string): Observable<T> {
    return commonSubject.pipe(
      filter((x) => x.subjectName === subjectName),
      map((x) => x.payload as T),
      shareReplay(1),
    )
  }

  function publish<K extends LegalUiChanges[keyof LegalUiChanges]>(subjectName: string, event: K) {
    const accumulatedEvent = reducers.hasOwnProperty(subjectName)
      ? reducers[subjectName](lastPayload(subjectName) || {}, event)
      : lastPayload(subjectName)

    latest[subjectName] = accumulatedEvent
    commonSubject.next({
      subjectName,
      payload: accumulatedEvent,
    })
  }

  function lastPayload<T>(subject: string): T {
    return latest[subject]
  }

  function clear(subject: string): any {
    delete latest[subject]
  }

  function configureSubject<
    T extends SupportedUIChangeType,
    K extends LegalUiChanges[keyof LegalUiChanges],
  >(subject: string, reducer: (prev: T, event: K) => T, initialState?: T): void {
    reducers[subject] = reducer
    if (initialState) {
      latest[subject] = initialState
    }
  }

  return {
    subscribe,
    publish,
    lastPayload,
    clear,
    configureSubject,
  }
}

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
