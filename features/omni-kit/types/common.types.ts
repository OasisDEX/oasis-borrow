import { OmniBorrowFormState } from 'features/omni-kit/state/borrow/borrowFormReducto.types'
import { OmniMultiplyFormState } from 'features/omni-kit/state/multiply/multiplyFormReducto.types'
import { OmniEarnFormState } from 'features/omni-kit/state/earn/earnFormReducto.types'

export type OmniProduct = 'borrow' | 'earn' | 'multiply'
export type OmniFlow = 'open' | 'manage'
export type OmniSidebarStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction' | 'transition'
export type OmniSidebarEditingStep = Extract<OmniSidebarStep, 'setup' | 'manage'>
export type OmniCloseTo = 'collateral' | 'quote'

export type OmniValidationItem = {
  message: { translationKey?: string; component?: JSX.Element; params?: { [key: string]: string } }
}

export interface OmniIsCachedPosition {
  cached?: boolean
}


export type OmniBorrowPanel = 'collateral' | 'quote' | 'switch' | 'close' | 'adjust'
export type OmniEarnPanel = 'adjust' | 'liquidity' | 'claim-collateral'
export type OmniMultiplyPanel = 'adjust' | 'collateral' | 'quote' | 'switch' | 'close'


export type OmniBorrowAction =
  | 'open-borrow'
  | 'deposit-borrow'
  | 'withdraw-borrow'
  | 'generate-borrow'
  | 'payback-borrow'
  | 'switch-borrow'
  | 'close-borrow'
  | 'adjust-borrow'

export type OmniEarnAction = 'open-earn' | 'deposit-earn' | 'withdraw-earn' | 'claim-earn'

export type OmniMultiplyAction =
  | 'open-multiply'
  | 'adjust'
  | 'deposit-collateral-multiply'
  | 'deposit-quote-multiply'
  | 'generate-multiply'
  | 'payback-multiply'
  | 'withdraw-multiply'
  | 'switch-multiply'
  | 'close-multiply'


export type OmniFormAction = OmniBorrowAction | OmniEarnAction | OmniMultiplyAction

export type OmniFormState = OmniBorrowFormState | OmniMultiplyFormState| OmniEarnFormState
