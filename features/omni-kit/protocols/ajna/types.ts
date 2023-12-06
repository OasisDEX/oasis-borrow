import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'

export type AjnaGenericPosition = AjnaPosition | AjnaEarnPosition

export type AjnaUpdateState<T> = (key: keyof T, value: T[keyof T]) => void

export interface AjnaIsCachedPosition {
  cached?: boolean
}

export type AjnaSupportedNetworksIds =
  | NetworkIds.MAINNET
  | NetworkIds.GOERLI
  | NetworkIds.BASEMAINNET
