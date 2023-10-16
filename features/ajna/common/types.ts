import type { AjnaEarnPosition, BorrowishPosition } from '@oasisdex/dma-library'

export type AjnaGenericPosition = BorrowishPosition | AjnaEarnPosition

export type AjnaUpdateState<T> = (key: keyof T, value: T[keyof T]) => void

export type ValidationItem = {
  message: { translationKey?: string; component?: JSX.Element; params?: { [key: string]: string } }
}

export interface IsCachedPosition {
  cached?: boolean
}
