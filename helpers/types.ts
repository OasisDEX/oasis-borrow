import { ManageMultiplyVaultState } from 'features/manageMultiplyVault/manageMultiplyVault'
import { ManageVaultState } from 'features/manageVault/manageVault'
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
