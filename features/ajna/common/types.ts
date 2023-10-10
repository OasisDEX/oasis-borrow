import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AllNetworksContractsType } from 'blockchain/contracts'

import type { AjnaBorrowAction, AjnaEarnAction, AjnaMultiplyAction } from './types/AjnaAction.types'

export type AjnaGenericPosition = AjnaPosition | AjnaEarnPosition
export type AjnaProduct = 'borrow' | 'earn' | 'multiply'
export type AjnaFlow = 'open' | 'manage'
export type AjnaFormAction = AjnaBorrowAction | AjnaEarnAction | AjnaMultiplyAction

export type AjnaSidebarStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction' | 'transition'

export type AjnaSidebarEditingStep = Extract<AjnaSidebarStep, 'setup' | 'manage'>

export type AjnaCloseTo = 'collateral' | 'quote'

export type AjnaPoolPairs = keyof AllNetworksContractsType[1]['ajnaPoolPairs']

export type AjnaPoolData = {
  [key in AjnaPoolPairs]: {
    '7DayNetApy': BigNumber
    '90DayNetApy': BigNumber
    annualFee: BigNumber
    liquidityAvailable: BigNumber
    lowestUtilizedPriceIndex: number
    maxLtv: BigNumber
    maxMultiply: BigNumber
    minLtv: BigNumber
    minPositionSize: BigNumber
    tvl: BigNumber
    with50Tokens: BigNumber
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

export type AjnaValidationItem = {
  message: { translationKey?: string; component?: JSX.Element; params?: { [key: string]: string } }
}

export interface AjnaIsCachedPosition {
  cached?: boolean
}
