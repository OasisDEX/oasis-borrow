import BigNumber from 'bignumber.js'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { pick } from 'ramda'

import { AllowanceOption } from '../features/allowance/allowance'

export interface GetPrimaryButtonLabelParams {
  flow: SidebarFlow
  stage: SidebarVaultStages
  token: string
  id?: BigNumber
  proxyAddress?: string
  insufficientAllowance?: boolean
}

export function extractSidebarButtonLabelParams(state: GetPrimaryButtonLabelParams) {
  return pick(['flow', 'stage', 'token', 'id', 'proxyAddress', 'insufficientAllowance'], state)
}

export interface HasAllowanceData {
  stage: SidebarVaultStages
  token: string
  selectedAllowanceRadio: AllowanceOption
  depositAmount?: BigNumber
  allowanceAmount?: BigNumber
  updateAllowanceAmount?: (amount?: BigNumber) => void
  setAllowanceAmountUnlimited?: () => void
  setAllowanceAmountToDepositAmount?: () => void
  setAllowanceAmountCustom?: () => void
}

export function extractAllowanceDataFromOpenVaultState(state: HasAllowanceData) {
  return pick(
    [
      'stage',
      'token',
      'depositAmount',
      'allowanceAmount',
      'updateAllowanceAmount',
      'setAllowanceAmountUnlimited',
      'setAllowanceAmountToDepositAmount',
      'setAllowanceAmountCustom',
      'selectedAllowanceRadio',
    ],
    state,
  )
}

export interface HasSidebarTxData {
  stage: SidebarVaultStages
  token: string
  safeConfirmations: number
  proxyTxHash?: string
  allowanceTxHash?: string
  openTxHash?: string
  etherscan?: string
  proxyConfirmations?: number
  id?: BigNumber
}

export function extractSidebarTxData(state: HasSidebarTxData) {
  return pick(
    [
      'stage',
      'proxyTxHash',
      'allowanceTxHash',
      'openTxHash',
      'etherscan',
      'proxyConfirmations',
      'safeConfirmations',
      'token',
    ],
    state,
  )
}
