import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { OpenGuniVaultState } from 'features/earn/guni/open/pipes/openGuniVault'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import { TFunction } from 'next-i18next'
import { ParsedUrlQuery } from 'querystring'
import { AbiInput, AbiItem } from 'web3-utils'

export type WithChildren = { children?: any }
export type WithTranslation = { t: TFunction }
export type WithQuery = { query?: ParsedUrlQuery }
export type WithReadonlyAccount = { readonlyAccount?: boolean }
export type CommonVaultState =
  | OpenVaultState
  | ManageStandardBorrowVaultState
  | OpenMultiplyVaultState
  | ManageMultiplyVaultState
  | OpenGuniVaultState

type Shift<A extends Array<any>> = ((...args: A) => void) extends (
  ...args: [A[0], ...(infer R)]
) => void
  ? R
  : never

type GrowExpRev<
  A extends Array<any>,
  N extends number,
  P extends Array<Array<any>>
> = A['length'] extends N
  ? A
  : {
      0: GrowExpRev<[...A, ...P[0]], N, P>
      1: GrowExpRev<A, N, Shift<P>>
    }[[...A, ...P[0]][N] extends undefined ? 0 : 1]

type GrowExp<
  A extends Array<any>,
  N extends number,
  P extends Array<Array<any>>
> = A['length'] extends N
  ? A
  : {
      0: GrowExp<[...A, ...A], N, [A, ...P]>
      1: GrowExpRev<A, N, P>
    }[[...A, ...A][N] extends undefined ? 0 : 1]

export type FixedSizeArray<T, N extends number> = N extends 0
  ? []
  : N extends 1
  ? [T]
  : GrowExp<[T, T], N, [[T]]>

export type TxError = {
  name: string
  message?: string
}

export type Abi = Omit<AbiItem, 'type' | 'stateMutability' | 'inputs'> & {
  internalType?: string
  type: string // 'function' | 'constructor' | 'event' | 'fallback'
  stateMutability?: string // 'pure' | 'view' | 'nonpayable' | 'payable'
  inputs?: (AbiInput & { internalType?: string })[]
}

export type Unbox<T> = T extends Promise<infer U> ? U : T extends Array<infer Y> ? Y : never
