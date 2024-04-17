import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { settings } from 'features/omni-kit/protocols/ajna/settings'
import type { NetworkIdsWithValues } from 'features/omni-kit/types'

export type AjnaGenericPosition = AjnaPosition | AjnaEarnPosition

export type AjnaUpdateState<T> = (key: keyof T, value: T[keyof T]) => void

export type AjnaSupportedNetworkIds = (typeof settings.supportedNetworkIds)[number]

export type AjnaWeeklyRewards = NetworkIdsWithValues<{
  [key: string]: {
    amount: BigNumber
    borrowShare: BigNumber
    earnShare: BigNumber
  }
}>
