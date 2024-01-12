import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { settings } from 'features/omni-kit/protocols/ajna/settings'

export type AjnaGenericPosition = AjnaPosition | AjnaEarnPosition

export type AjnaUpdateState<T> = (key: keyof T, value: T[keyof T]) => void

export type AjnaSupportedNetworkIds = (typeof settings.supportedNetworkIds)[number]
