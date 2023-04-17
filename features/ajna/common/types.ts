import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { AllNetworksContractsType } from 'blockchain/contracts'
import { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { AjnaMultiplyPosition } from 'features/ajna/positions/multiply/temp'

export type AjnaGenericPosition = AjnaPosition | AjnaEarnPosition | AjnaMultiplyPosition
export type AjnaProduct = 'borrow' | 'earn' | 'multiply'
export type AjnaFlow = 'open' | 'manage'
export type AjnaFormState = AjnaBorrowFormState | AjnaEarnFormState | AjnaMultiplyFormState

export type AjnaBorrowAction =
  | 'open-borrow'
  | 'deposit-borrow'
  | 'withdraw-borrow'
  | 'generate-borrow'
  | 'payback-borrow'
export type AjnaBorrowPanel = 'collateral' | 'quote'

export type AjnaEarnAction = 'open-earn' | 'deposit-earn' | 'withdraw-earn'
export type AjnaEarnPanel = 'adjust' | 'liquidity'

export type AjnaMultiplyAction =
  | 'open-multiply'
  | 'deposit-multiply'
  | 'withdraw-multiply'
  | 'payback-multiply'
  | 'deposit-quote-multiply'
  | 'withdraw-quote-multiply'
  | 'switch-multiply'
  | 'close-multiply'
export type AjnaMultiplyPanel = 'collateral' | 'quote' | 'switch' | 'close'

export type AjnaSidebarStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction'
export type AjnaSidebarEditingStep = Extract<AjnaSidebarStep, 'setup' | 'manage'>

export type AjnaPoolPairs = keyof AllNetworksContractsType[1]['ajnaPoolPairs']

export type AjnaPoolData = {
  [key in keyof AjnaPoolPairs]: {
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

export type AjnaUpdateState<T> = (key: keyof T, value: T[keyof T]) => void

export type AlternateProductCardBase = {
  token: string
  headerKey: string
  icon: string
  background: string
  banner: {
    titleKey: string
  }
  button: {
    link: string
    hash: string
    labelKey: string
  }
  labels: { titleKey: string; value: string }[]
}

type CardComputedProperties = { computed: { tokens: string[] } }

// for now borrow and earn are the same but eventually
// CardComputedProperties will be different and potentially
// AlternateProductCardBase as well
export type AjnaProductCardsBorrow = AlternateProductCardBase & CardComputedProperties
export type AjnaProductCardsEarn = AlternateProductCardBase & CardComputedProperties

export type AjnaProductCardsData = {
  borrowCards: AjnaProductCardsBorrow[]
  earnCards: AjnaProductCardsEarn[]
  multiplyCards: unknown[]
}
