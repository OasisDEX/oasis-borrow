import type {
  AutoBSChangeAction,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange.types'
import type {
  AutomationChangeFeature,
  AutomationChangeFeatureAction,
} from 'features/automation/common/state/automationFeatureChange.types'
import type {
  AutoTakeProfitFormChange,
  AutoTakeProfitFormChangeAction,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.types'
import type {
  ConstantMultipleChangeAction,
  ConstantMultipleFormChange,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.types'
import type {
  MultiplyPillChange,
  MultiplyPillChangeAction,
} from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange.types'
import type {
  StopLossFormChange,
  StopLossFormChangeAction,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import type {
  FollowedVaultsLimitReachedChange,
  FollowedVaultsLimitReachedChangeAction,
} from 'features/follow/common/followedVaultsLimitReached'
import type { TabChange, TabChangeAction } from 'features/generalManageVault/TabChange.types'
import type { SwapWidgetChangeAction, SwapWidgetState } from 'features/swapWidget/SwapWidgetChange'
import type { Observable } from 'rxjs'

import type { TxPayloadChange, TxPayloadChangeAction } from './gasEstimate.types'

export type SupportedUIChangeType =
  | StopLossFormChange
  | AutoBSFormChange
  | ConstantMultipleFormChange
  | TabChange
  | MultiplyPillChange
  | SwapWidgetState
  | AutomationChangeFeature
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
