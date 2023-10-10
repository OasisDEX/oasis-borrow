import type BigNumber from 'bignumber.js'
import type { Observable } from 'rxjs'

import type { Vault } from './vaults.types'

export interface InstiVault extends Vault {
  originationFeePercent: BigNumber
  activeCollRatio: BigNumber
  activeCollRatioPriceUSD: BigNumber
  termEnd: Date
  currentFixedFee: BigNumber
  nextFeeChange: string
}
export type CharterStreamFactory = (args: { ilk: string; usr: string }) => Observable<BigNumber>
