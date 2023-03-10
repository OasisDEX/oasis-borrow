import { BigNumber } from 'bignumber.js'
import { getIsAllowanceStage } from 'features/allowance/allowance'
import { zero } from 'helpers/zero'

import { DsrDepositStage, DsrDepositState } from '../helpers/dsrDeposit'
import { DsrWithdrawStage } from '../pipes/dsrWithdraw'
import { DsrSidebarTabOptions } from '../sidebar/DsrSideBar'

// TODO: Move this to translations and add withdraw logic
export function createPrimaryButtonLabel({
  stage,
  activeTab,
  depositInputValue,
  proxyAddress,
  daiAllowance,
}: {
  stage: DsrDepositStage | DsrWithdrawStage
  activeTab: DsrSidebarTabOptions
  depositInputValue?: BigNumber
  proxyAddress?: string
  daiAllowance?: BigNumber
}) {
  if (['depositSuccess', 'withdrawSuccess'].includes(stage)) return 'Finished'
  if (['depositFiasco', 'withdrawFiasco', 'proxyFailure', 'allowanceFailure'].includes(stage))
    return 'Retry'
  if (stage === 'depositInProgress' && activeTab === 'deposit') return 'Depositing DAI'
  if (stage === 'withdrawInProgress' && activeTab === 'withdraw') return 'Withdrawing DAI'
  if (stage === 'proxySuccess') return 'Set Allowance'
  if (activeTab === 'withdraw') return 'Withdraw'
  if (depositInputValue && !proxyAddress) return 'Setup Proxy'
  if (stage === 'allowanceSuccess') return 'Go to deposit'
  if (
    (depositInputValue && depositInputValue.gt(daiAllowance || zero)) ||
    getIsAllowanceStage(stage)
  )
    return 'Set Allowance'
  return 'Deposit'
}

export function selectPrimaryAction(
  stage: DsrWithdrawStage | DsrDepositStage,
  activeTab: DsrSidebarTabOptions,
  dsrDepositState: DsrDepositState,
) {
  switch (stage) {
    case 'allowanceWaitingForConfirmation':
    case 'allowanceSuccess':
    case 'allowanceFailure':
      return dsrDepositState.progress
    case 'proxyWaitingForConfirmation':
    case 'proxySuccess':
    case 'proxyFailure':
      return dsrDepositState.proxyProceed
    case 'depositSuccess':
      return dsrDepositState.reset
    case 'withdrawSuccess':
      return dsrDepositState.reset
    default:
      return activeTab === 'deposit' ? dsrDepositState.deposit : dsrDepositState.withdraw
  }
}

export function isDsrButtonDisabled({
  stage,
  isLoading,
  depositInputValue,
  withDrawInputValue,
  selectedAllowanceRadio,
  isOwner,
  validationMessages,
  allowanceAmount,
}: {
  stage: DsrDepositStage
  isLoading: boolean
  depositInputValue?: BigNumber
  withDrawInputValue?: BigNumber
  selectedAllowanceRadio?: string
  isOwner: boolean
  validationMessages: string[]
  allowanceAmount?: BigNumber
}) {
  if (
    !isOwner ||
    isLoading ||
    (!depositInputValue && !withDrawInputValue) ||
    (!!validationMessages.length &&
      !['depositSuccess', 'withdrawSuccess', 'proxySuccess', 'allowanceSuccess'].includes(stage)) ||
    (stage === 'allowanceWaitingForConfirmation' && !allowanceAmount)
  )
    return true

  if (getIsAllowanceStage(stage)) {
    return !selectedAllowanceRadio
  }
  return false
}
