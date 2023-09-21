import type { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import type { TxHelpers } from 'helpers/context/TxHelpers'

import type {
  AllowanceChanges,
  AllowanceConditions,
  AllowanceFunctions,
  AllowanceStages,
  AllowanceState,
  StateDependencies,
} from './allowance.types'
import { ALLOWANCE_STAGES } from './allowance.types'
import { setAllowance } from './setAllowance'

export function getIsAllowanceStage(stage: string): stage is AllowanceStages {
  return ALLOWANCE_STAGES.includes(stage as any)
}

export function applyIsAllowanceStage<S extends { stage: string }>(state: S): S {
  return {
    ...state,
    isAllowanceStage: getIsAllowanceStage(state.stage),
  }
}

export function applyAllowanceChanges<S extends AllowanceState & StateDependencies>(
  state: S,
  change: AllowanceChanges,
): S {
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
    return {
      ...state,
      stage: 'allowanceSuccess',
      allowance,
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

export function allowanceTransitions<
  S extends AllowanceState & AllowanceFunctions & StateDependencies,
>(
  txHelpers: TxHelpers,
  change: (ch: AllowanceChanges) => void,
  data: { tokenToAllow: string },
  state: S,
): S {
  if (state.stage === 'allowanceWaitingForConfirmation' || state.stage === 'allowanceFailure') {
    return {
      ...state,
      updateAllowanceAmount: (allowanceAmount?: BigNumber) =>
        change({
          kind: 'allowance',
          allowanceAmount,
        }),
      setAllowanceAmountUnlimited: () => change({ kind: 'allowanceUnlimited' }),
      setAllowanceAmountToDepositAmount: () =>
        change({
          kind: 'allowanceAsDepositAmount',
        }),
      setAllowanceAmountCustom: () =>
        change({
          kind: 'allowanceCustom',
        }),
      progress: () => setAllowance(txHelpers, change, { ...state, token: data.tokenToAllow }),
      // TODO: figure out how to pass in tokenToAllow
      regress: () => change({ kind: 'regressAllowance' }),
    }
  }

  if (state.stage === 'allowanceSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'backToEditing',
        }),
    }
  }

  return state
}

export function applyAllowanceConditions<
  S extends AllowanceState & { depositAmount?: BigNumber; token: string },
>(state: S): S & AllowanceConditions {
  const { selectedAllowanceRadio, allowanceAmount, depositAmount, token, allowance } = state
  const customAllowanceAmountExceedsMaxUint256 = !!(
    selectedAllowanceRadio === 'custom' && allowanceAmount?.gt(maxUint256)
  )

  const customAllowanceAmountLessThanDepositAmount = !!(
    selectedAllowanceRadio === 'custom' &&
    allowanceAmount &&
    depositAmount &&
    allowanceAmount.lt(depositAmount)
  )

  const insufficientAllowance =
    token !== 'ETH' &&
    !!(depositAmount && !depositAmount.isZero() && (!allowance || depositAmount.gt(allowance)))

  const customAllowanceAmountEmpty = selectedAllowanceRadio === 'custom' && !allowanceAmount
  return {
    ...state,
    customAllowanceAmountEmpty,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    insufficientAllowance,
  }
}
