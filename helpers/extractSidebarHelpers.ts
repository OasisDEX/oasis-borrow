import BigNumber from 'bignumber.js'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { pick } from 'ramda'

import { AllowanceOption } from '../features/allowance/allowance'

interface SharedStateExtractions {
  stage: SidebarVaultStages
  token?: string
  vault?: {
    token: string
  }
}

export interface GetPrimaryButtonLabelParams {
  flow: SidebarFlow
  stage: SidebarVaultStages
  token: string
  id?: BigNumber
  proxyAddress?: string
  insufficientAllowance?: boolean
  insufficientCollateralAllowance?: boolean
  insufficientDaiAllowance?: boolean
  canTransition?: boolean
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

export interface HasSidebarTxData extends SharedStateExtractions {
  id?: BigNumber
  proxyTxHash?: string
  allowanceTxHash?: string
  openTxHash?: string
  manageTxHash?: string
  proxyConfirmations?: number
  safeConfirmations?: number
  etherscan?: string
}

export function extractSidebarTxData(state: HasSidebarTxData) {
  return {
    ...pick(
      [
        'stage',
        'id',
        'proxyTxHash',
        'allowanceTxHash',
        'openTxHash',
        'manageTxHash',
        'proxyConfirmations',
        'safeConfirmations',
        'etherscan',
      ],
      state,
    ),
    token: state.token || state.vault?.token,
  }
}
