import type { OtherAction } from 'features/multiply/manage/pipes/OtherAction.types'

export type MultiplyPillChangeAction = {
  type: 'change-multiply-pill'
  currentStage: OtherAction
}

export interface MultiplyPillChange {
  currentStage: OtherAction
}
