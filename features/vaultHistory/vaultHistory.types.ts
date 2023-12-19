import type BigNumber from 'bignumber.js'

import type { VaultEvent } from './vaultHistoryEvents.types'

export type VaultHistoryEvent = VaultEvent & {
  token: string
  etherscan?: {
    url: string
    apiUrl: string
    apiKey: string
  }
  daiAmount?: BigNumber
  collateralAmount?: BigNumber
  gasFee?: BigNumber
  depositCollateral?: BigNumber
}

export type WithSplitMark<T> = T & { splitId?: number }

export interface VaultHistoryChange {
  kind: 'vaultHistory'
  vaultHistory: VaultHistoryEvent[]
}
