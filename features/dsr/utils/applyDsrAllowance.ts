import { maxUint256 } from 'blockchain/calls/erc20.constants'
import type {
  AllowanceChanges,
  AllowanceState,
  StateDependencies,
} from 'features/allowance/allowance.types'

export function applyDsrAllowanceChanges<
  S extends AllowanceState & StateDependencies & { isMintingSDai: boolean },
>(state: S, change: AllowanceChanges): S {
  if (change.kind === 'allowance') {
    const { allowanceAmount } = change
    return {
      ...state,
      allowanceAmount,
    }
  }

  if (change.kind === 'allowanceAsDepositAmount') {
    const { depositAmount } = state
    return {
      ...state,
      selectedAllowanceRadio: 'depositAmount',
      allowanceAmount: depositAmount,
    }
  }

  if (change.kind === 'allowanceUnlimited') {
    return {
      ...state,
      selectedAllowanceRadio: 'unlimited',
      allowanceAmount: maxUint256,
    }
  }

  if (change.kind === 'allowanceCustom') {
    return {
      ...state,
      selectedAllowanceRadio: 'custom',
      allowanceAmount: undefined,
    }
  }

  if (change.kind === 'allowanceWaitingForApproval') {
    return {
      ...state,
      stage: 'allowanceWaitingForApproval',
    }
  }

  if (change.kind === 'allowanceInProgress') {
    const { allowanceTxHash } = change
    return {
      ...state,
      allowanceTxHash,
      stage: 'allowanceInProgress',
    }
  }

  if (change.kind === 'allowanceFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'allowanceFailure',
      txError,
    }
  }

  if (change.kind === 'allowanceSuccess') {
    const { allowance } = change

    const allowanceChange = state.isMintingSDai ? { daiWalletAllowance: allowance } : { allowance }

    return {
      ...state,
      stage: 'allowanceSuccess',
      ...allowanceChange,
    }
  }

  if (change.kind === 'regressAllowance') {
    return {
      ...state,
      ...(state.stage === 'allowanceFailure'
        ? { stage: 'allowanceWaitingForConfirmation' }
        : {
            stage: 'editing',
            allowanceAmount: maxUint256,
            selectedAllowanceRadio: 'unlimited',
          }),
    }
  }

  return state
}
