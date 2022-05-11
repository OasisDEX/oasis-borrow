import { BigNumber } from 'bignumber.js'
// import { maxUint256 } from 'blockchain/calls/erc20'
import { TxHelpers } from 'components/AppContext'
import { Observable } from 'rxjs'

import { TxError } from '../../helpers/types'
import { performClaimMultiple } from './performClaimMultiple'

export interface ClaimState {
  stage: ClaimStages
  claimTxHash?: string
  txError?: TxError
  claim?: BigNumber
  weeks?: any
  amounts?: any
  proofs?: any
  performClaimMultiple?: () => void
  updateClaimInput?: () => void
  isClaimStage?: boolean
}

export const defaultClaimState: ClaimState = {
  stage: 'claim',
  isClaimStage: false,
}

export interface Dependencies {
  stage: string
  weeks: any
  amounts: any
  proofs: any
}

export const CLAIM_STAGES = [
  'claim',
  'txWaitingForConfirmation',
  'txWaitingForApproval',
  'txInProgress',
  'txFailure',
  'txSuccess',
] as const

export type ClaimStages = typeof CLAIM_STAGES[number]

export function applyIsClaimStage<S extends { stage: string }>(state: S): S {
  return {
    ...state,
    isClaimStage: isClaimStage(state.stage),
  }
}

export type ClaimChanges =
  | { kind: 'txWaitingForApproval' }
  | {
      kind: 'txInProgress'
      claimTxHash: string
    }
  | {
      kind: 'txFailure'
      txError?: TxError
    }
  | {
      kind: 'txConfirming'
    }
  | {
      kind: 'txSuccess'
    }
  | {
      kind: 'claim'
      weeks?: any
      amounts?: any
      proofs?: any
    }
  | {
      kind: 'progressClaim'
    }

type BackToEditingChange = { kind: 'backToEditing' }

export function isClaimStage(stage: string): stage is ClaimStages {
  return CLAIM_STAGES.includes(stage as any)
}
export function applyClaimChanges<S extends ClaimState & Dependencies>(
  state: S,
  change: ClaimChanges,
): S {
  if (change.kind === 'txWaitingForApproval') {
    return {
      ...state,
      stage: 'txWaitingForApproval',
    }
  }

  if (change.kind === 'txInProgress') {
    const { claimTxHash } = change
    return {
      ...state,
      claimTxHash,
      stage: 'txInProgress',
    }
  }

  if (change.kind === 'txFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'txFailure',
      txError,
    }
  }

  if (change.kind === 'txSuccess') {
    return {
      ...state,
      stage: 'txSuccess',
    }
  }

  return state
}

export function addClaimTransitions<S extends ClaimState & Dependencies>(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ClaimChanges | BackToEditingChange) => void,
  state: S,
): S {
  if (state.stage === 'txWaitingForConfirmation' || state.stage === 'txFailure') {
    return {
      ...state,
      updateClaimInput: (weeks: any, proofs: any, amounts: any) =>
        change({
          kind: 'claim',
          weeks,
          proofs,
          amounts,
        }),

      performClaimMultiple: () => performClaimMultiple(txHelpers$, change, state),
    }
  }

  if (state.stage === 'txSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'progressClaim',
        }),
    }
  }

  return state
}
