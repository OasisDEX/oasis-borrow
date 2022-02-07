import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

import { VaultErrorMessage } from '../form/errorMessagesHandler'

export type OpenVaultTransitionChange =
  | {
      kind: 'progressEditing'
    }
  | {
      kind: 'backToEditing'
    }
  | {
      kind: 'clear'
    }

type GenericOpenVaultState = {
  errorMessages: VaultErrorMessage[]
  proxyAddress?: any
  depositAmount?: BigNumber
  allowance?: BigNumber
  token: string
}

export function createApplyOpenVaultTransition<
  OVS extends GenericOpenVaultState,
  MOVS,
  OVCalcs,
  OVConds
>(
  defaultMutableOpenVaultState: MOVS,
  defaultOpenVaultStateCalculations: OVCalcs,
  defaultOpenVaultConditions: OVConds,
): (openVaultState: OVS, openVaultChange: OpenVaultTransitionChange) => OVS {
  return function applyOpenVaultTransition(state: OVS, change: OpenVaultTransitionChange): OVS {
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
        : 'txWaitingForConfirmation'
      if (canProgress) {
        return {
          ...state,
          stage,
        }
      }
    }

    if (change.kind === 'backToEditing') {
      return {
        ...state,
        stage: 'editing',
      }
    }

    if (change.kind === 'clear') {
      return {
        ...state,
        ...defaultMutableOpenVaultState,
        ...defaultOpenVaultStateCalculations,
        ...defaultOpenVaultConditions,
      }
    }

    return state
  }
}
