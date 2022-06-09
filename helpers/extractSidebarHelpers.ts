import BigNumber from 'bignumber.js'
import { AllowanceOption } from 'features/allowance/allowance'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { pick } from 'ramda'

interface SharedStateExtractions {
  stage: SidebarVaultStages
  token?: string
  vault?: {
    token: string
  }
}

export interface SidebarAllowanceData {
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

export interface PrimaryButtonLabelParams extends SharedStateExtractions {
  id?: BigNumber
  proxyAddress?: string
  insufficientCollateralAllowance?: boolean
  insufficientDaiAllowance?: boolean
  insufficientAllowance?: boolean
  canTransition?: boolean
  isSLPanelVisible?: boolean
  shouldRedirectToCloseVault?: boolean
}

export interface SidebarTxData extends SharedStateExtractions {
  id?: BigNumber
  txHash?: string
  proxyTxHash?: string
  allowanceTxHash?: string
  openTxHash?: string
  manageTxHash?: string
  stopLossTxHash?: string
  proxyConfirmations?: number
  openVaultConfirmations?: number
  safeConfirmations?: number
  openVaultSafeConfirmations?: number
  etherscan?: string
  openFlowWithStopLoss?: boolean
}

export function extractSidebarAllowanceData(state: SidebarAllowanceData) {
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

export function extractPrimaryButtonLabelParams(state: PrimaryButtonLabelParams) {
  return {
    ...pick(
      [
        'stage',
        'id',
        'proxyAddress',
        'insufficientCollateralAllowance',
        'insufficientDaiAllowance',
        'insufficientAllowance',
        'canTransition',
      ],
      state,
    ),
    token: state.token || state.vault?.token,
  }
}

export function extractSidebarTxData(state: SidebarTxData) {
  return {
    ...pick(
      [
        'stage',
        'id',
        'txHash',
        'proxyTxHash',
        'allowanceTxHash',
        'openTxHash',
        'manageTxHash',
        'stopLossTxHash',
        'proxyConfirmations',
        'openVaultConfirmations',
        'safeConfirmations',
        'openVaultSafeConfirmations',
        'openFlowWithStopLoss',
        'etherscan',
      ],
      state,
    ),
    token: state.token || state.vault?.token,
  }
}
