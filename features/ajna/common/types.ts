import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaEarnFormState } from 'features/ajna/earn/state/ajnaEarnFormReducto'

export type AjnaProduct = 'borrow' | 'earn' | 'multiply'
export type AjnaFlow = 'open' | 'manage'
export type AjnaFormState = AjnaBorrowFormState | AjnaEarnFormState

export type AjnaBorrowAction =
  | 'open-borrow'
  | 'deposit-borrow'
  | 'withdraw-borrow'
  | 'generate-borrow'
  | 'payback-borrow'
export type AjnaBorrowPanel = 'collateral' | 'quote'

export type AjnaEarnAction = 'open-earn' | 'deposit-earn' | 'withdraw-earn'
export type AjnaEarnPanel = 'adjust' | 'liquidity'

export type AjnaSidebarStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction'
export type AjnaSidebarEditingStep = Extract<AjnaSidebarStep, 'setup' | 'manage'>

export type AjnaPoolPairs = keyof Context['ajnaPoolPairs']

export type AjnaPoolData = {
  [key in keyof Context['ajnaPoolPairs']]: {
    '7DayNetApy': BigNumber
    '90DayNetApy': BigNumber
    annualFee: BigNumber
    liquidityAvaliable: BigNumber
    maxMultiply: BigNumber
    maxLtv: BigNumber
    minLtv: BigNumber
    minPositionSize: BigNumber
    tvl: BigNumber
  }
}

export type AjnaBorrowUpdateState = (
  key: keyof AjnaBorrowFormState,
  value: AjnaBorrowFormState[keyof AjnaBorrowFormState],
) => void

export type AjnaEarnUpdateState = (
  key: keyof AjnaEarnFormState,
  value: AjnaEarnFormState[keyof AjnaEarnFormState],
) => void
