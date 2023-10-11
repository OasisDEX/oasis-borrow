import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'

export type AjnaGenericPosition = AjnaPosition | AjnaEarnPosition

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
