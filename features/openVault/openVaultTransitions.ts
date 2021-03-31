import { zero } from 'helpers/zero'

import { OpenVaultChange, OpenVaultState } from './openVault'

export type OpenVaultTransitionChange =
  | {
      kind: 'progressEditing'
    }
  | {
      kind: 'progressProxy'
    }
  | {
      kind: 'backToEditing'
    }

export function applyOpenVaultTransition(
  change: OpenVaultChange,
  state: OpenVaultState,
): OpenVaultState {
  if (change.kind === 'progressEditing') {
    const { errorMessages, proxyAddress, depositAmount, allowance } = state
    const canProgress = !errorMessages.length
    const hasProxy = !!proxyAddress

    const openingEmptyVault = depositAmount ? depositAmount.eq(zero) : true
    const depositAmountLessThanAllowance =
      allowance && depositAmount && allowance.gte(depositAmount)

    const hasAllowance =
      state.token === 'ETH' ? true : depositAmountLessThanAllowance || openingEmptyVault

    const stage = !hasProxy
      ? 'proxyWaitingForConfirmation'
      : !hasAllowance
      ? 'allowanceWaitingForConfirmation'
      : 'openWaitingForConfirmation'
    if (canProgress) {
      return {
        ...state,
        stage,
      }
    }
  }

  if (change.kind === 'progressProxy') {
    return {
      ...state,
      stage: state.token === 'ETH' ? 'editing' : 'allowanceWaitingForConfirmation',
    }
  }

  if (change.kind === 'backToEditing') {
    return {
      ...state,
      stage: 'editing',
    }
  }

  return state
}
