import { ManageMultiplyVaultState } from 'features/manageMultiplyVault/manageMultiplyVault'
import { ManageVaultState } from 'features/manageVault/manageVault'
import { OpenGuniVaultState } from 'features/openGuniVault/openGuniVault'
import { OpenMultiplyVaultState } from 'features/openMultiplyVault/openMultiplyVault'
import { OpenVaultState } from 'features/openVault/openVault'
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
