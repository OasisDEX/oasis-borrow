import type BigNumber from 'bignumber.js'
import type { Observable } from 'rxjs'

export enum VaultType {
  Borrow = 'borrow',
  Multiply = 'multiply',
  Earn = 'earn',
  Unknown = 'unknown',
}

export type SaveVaultType = (
  id: BigNumber,
  token: string,
  vaultType: VaultType,
  chainId: number,
  protocol: string,
) => Observable<void>
