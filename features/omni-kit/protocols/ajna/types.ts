import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'

export type AjnaGenericPosition = AjnaPosition | AjnaEarnPosition

export type AjnaUpdateState<T> = (key: keyof T, value: T[keyof T]) => void

export interface AjnaIsCachedPosition {
  cached?: boolean
}
