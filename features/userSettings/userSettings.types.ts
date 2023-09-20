import type BigNumber from 'bignumber.js'
import type { Observable } from 'rxjs'

type UserSettingsStage = 'editing' | 'inProgress' | 'success' | 'failure'

export type UserSettingsErrorMessages = 'invalidSlippage'

export type UserSettingsWarningMessages = 'highSlippage'

export interface UserSettingsState {
  stage: UserSettingsStage
  slippage: BigNumber
  slippageInput: BigNumber
  setSlippageInput: (slippageInput: BigNumber) => void
  saveSettings?: () => void
  reset: () => void
  errors: UserSettingsErrorMessages[]
  warnings: UserSettingsWarningMessages[]
  canProgress: boolean
}
export type UserSettingsChange =
  | { kind: 'stage'; stage: UserSettingsStage }
  | { kind: 'settingsSaved'; slippageInput: BigNumber }
  | { kind: 'slippageInput'; slippageInput: BigNumber }

export type SaveUserSettingsFunction = (slippageInput: BigNumber) => Observable<boolean>
export interface SlippageChange {
  kind: 'slippage'
  slippage: BigNumber
}
