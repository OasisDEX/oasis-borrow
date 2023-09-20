import type { OtherAction } from 'features/multiply/manage/pipes/types'

export type MultiplyPillChangeAction = {
  type: 'change-multiply-pill'
  currentStage: OtherAction
}

export interface MultiplyPillChange {
  currentStage: OtherAction
}
