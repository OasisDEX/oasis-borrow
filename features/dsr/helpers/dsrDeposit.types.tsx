// @ts-nocheck
import type BigNumber from 'bignumber.js'
import type { SelectedDaiAllowanceRadio } from 'components/vault/commonMultiply/ManageVaultDaiAllowance.types'
import type { Change, Changes } from 'helpers/form'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'

export type DsrSidebarTabOptions = 'deposit' | 'withdraw' | 'convert'

export type DsrDepositStage =
  | 'editing'
  | 'depositWaiting4Confirmation'
  | 'depositWaiting4Approval'
  | 'depositInProgress'
  | 'depositFiasco'
  | 'depositSuccess'
  | 'withdrawWaiting4Confirmation'
  | 'withdrawWaiting4Approval'
  | 'withdrawInProgress'
  | 'withdrawFiasco'
  | 'withdrawSuccess'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'allowanceSuccess'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
export type DsrDepositMessage = {
  kind: 'amountIsEmpty' | 'amountBiggerThanBalance' | 'amountBiggerThanDeposit'
}
export interface DsrDepositState extends HasGasEstimation {
  stage: DsrDepositStage
  proxyAddress: string
  walletAddress: string
  allowanceTxHash?: string
  depositTxHash?: string
  withdrawTxHash?: string
  proxyTxHash?: string
  daiBalance: BigNumber
  sDaiBalance: BigNumber
  allowance?: BigNumber
  daiWalletAllowance?: BigNumber
  amount?: BigNumber
  depositAmount?: BigNumber
  messages: DsrDepositMessage[]
  change: (change: ManualChange | CheckboxChange) => void
  reset?: () => void
  proceed?: () => void
  setAllowance?: () => void
  deposit?: () => void
  back?: () => void
  proxyProceed?: () => void
  proxyBack?: () => void
  selectedAllowanceRadio?: SelectedDaiAllowanceRadio
  operation: DsrSidebarTabOptions
  operationChange: (operation: DsrSidebarTabOptions) => void
  withdraw?: () => void
  convert?: () => void
  daiDeposit: BigNumber
  progress?: () => void
  potDsr: BigNumber
  token: string
  proxyConfirmations?: number
  allowanceAmount?: BigNumber
  netValue?: BigNumber
  isMintingSDai: boolean
}

export type ManualChange = Change<DsrDepositState, 'amount'>
export type DaiBalanceChange = Change<DsrDepositState, 'daiBalance'>
export type SDaiBalanceChange = Change<DsrDepositState, 'sDaiBalance'>
export type DsrCreationChange = Changes<DsrDepositState>
export type CheckboxChange = Changes<DsrDepositState, 'isMintingSDai'>
export type WalletAddressChange = Changes<DsrDepositState, 'walletAddress'>
