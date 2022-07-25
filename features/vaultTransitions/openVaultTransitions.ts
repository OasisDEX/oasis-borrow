import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

import { VaultErrorMessage } from '../form/errorMessagesHandler'

export type OpenVaultTransitionChange =
  | {
      kind: 'progressEditing'
    }
  | { kind: 'progressStopLossEditing' }
  | { kind: 'skipStopLoss' }
  | {
      kind: 'backToEditing'
    }
  | {
      kind: 'clear'
    }

type GenericOpenVaultState = {
  withStopLossStage: boolean
  withProxyStep: boolean
  withAllowanceStep: boolean
  proxySuccess?: string
  generateAmount?: BigNumber
  afterOutstandingDebt?: BigNumber
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
        : state.withStopLossStage &&
          (state.generateAmount?.gt(zero) || state.afterOutstandingDebt?.gt(zero))
        ? 'stopLossEditing'
        : 'txWaitingForConfirmation'

      if (canProgress) {
        return {
          ...state,
          stage,
        }
      }
    }

    if (change.kind === 'progressStopLossEditing') {
      const { errorMessages } = state
      const canProgress = !errorMessages.length

      const stage = 'txWaitingForConfirmation'

      if (canProgress) {
        return {
          ...state,
          stage,
        }
      }
    }

    if (change.kind === 'skipStopLoss') {
      const stage = 'txWaitingForConfirmation'

      return {
        ...state,
        stopLossSkipped: true,
        stage,
      }
    }

    if (change.kind === 'backToEditing') {
      return {
        ...state,
        stopLossSkipped: false,
        withProxyStep: !!state.proxySuccess,
        withAllowanceStep: false,
        stopLossLevel: zero,
        stopLossCloseType: 'dai',
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
