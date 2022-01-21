import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'
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
  | ManageVaultState
  | OpenMultiplyVaultState
  | ManageMultiplyVaultState
  | OpenGuniVaultState

export type TxError = {
  name: string
}

export type Abi = Omit<AbiItem, 'type' | 'stateMutability' | 'inputs'> & {
  internalType?: string
  type: string // 'function' | 'constructor' | 'event' | 'fallback'
  stateMutability?: string // 'pure' | 'view' | 'nonpayable' | 'payable'
  inputs?: (AbiInput & { internalType?: string })[]
}
