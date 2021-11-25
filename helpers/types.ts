import { ManageMultiplyVaultState } from 'features/manageMultiplyVault/manageMultiplyVault'
import { ManageVaultState } from 'features/manageVault/manageVault'
import { OpenGuniVaultState } from 'features/openGuniVault/openGuniVault'
import { OpenMultiplyVaultState } from 'features/openMultiplyVault/openMultiplyVault'
import { OpenVaultState } from 'features/openVault/openVault'
import { TFunction } from 'next-i18next'
import { ParsedUrlQuery } from 'querystring'

export type WithChildren = { children?: any }
export type WithTranslation = { t: TFunction }
export type WithQuery = { query?: ParsedUrlQuery }
export type WithReadonlyAccount = { readonlyAccount?: boolean }
export type CommonVaultState =
  | OpenVaultState
  | ManageVaultState
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
