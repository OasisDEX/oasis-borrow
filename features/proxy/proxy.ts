import { TxHelpers } from 'components/AppContext'
import { createProxy } from 'features/proxy/createProxy'
import { Observable } from 'rxjs'

import { TxError } from '../../helpers/types'

export interface ProxyState {
  proxyTxHash?: string
  txError?: TxError
  proxyConfirmations?: number
  proxyAddress?: string
  progress?(): void
  regress?(): void
  isProxyStage: boolean
  proxySuccess?: boolean
}

export const defaultProxyStage: ProxyState = {
  isProxyStage: false,
}

interface Dependencies {
  stage: string
  token: string
  safeConfirmations: number
}

export const PROXY_STAGES = [
  'proxyWaitingForConfirmation',
  'proxyWaitingForApproval',
  'proxyInProgress',
  'proxyFailure',
  'proxySuccess',
] as const

export type ProxyStages = typeof PROXY_STAGES[number]

export function isProxyStage(stage: string): stage is ProxyStages {
  return PROXY_STAGES.includes(stage as any)
}

export function applyIsProxyStage<S extends { stage: string }>(state: S): S {
  return {
    ...state,
    isProxyStage: isProxyStage(state.stage),
  }
}
export type ProxyChanges =
  | {
      kind: 'proxyWaitingForApproval'
    }
  | {
      kind: 'proxyInProgress'
      proxyTxHash: string
    }
  | {
      kind: 'proxyFailure'
      txError?: TxError
    }
  | {
      kind: 'proxyConfirming'
      proxyConfirmations?: number
    }
  | {
      kind: 'proxySuccess'
      proxyAddress: string
    }
  | {
      kind: 'progressProxy'
    }

type BackToEditingChange = { kind: 'backToEditing' }

export function applyProxyChanges<S extends ProxyState & Dependencies>(
  state: S,
  change: ProxyChanges,
): S {
  if (change.kind === 'progressProxy') {
    return {
      ...state,
      stage: state.token === 'ETH' ? 'editing' : 'allowanceWaitingForConfirmation',
    }
  }

  if (change.kind === 'proxyWaitingForApproval') {
    return {
      ...state,
      stage: 'proxyWaitingForApproval',
    }
  }

  if (change.kind === 'proxyInProgress') {
    const { proxyTxHash } = change
    return {
      ...state,
      stage: 'proxyInProgress',
      proxyTxHash,
    }
  }

  if (change.kind === 'proxyFailure') {
    const { txError } = change
    return { ...state, stage: 'proxyFailure', txError }
  }

  if (change.kind === 'proxyConfirming') {
    const { proxyConfirmations } = change
    return {
      ...state,
      proxyConfirmations,
    }
  }

  if (change.kind === 'proxySuccess') {
    const { proxyAddress } = change
    return {
      ...state,
      proxyAddress,
      stage: 'proxySuccess',
      proxySuccess: true,
    }
  }

  return state
}

export function addProxyTransitions<S extends ProxyState & Dependencies>(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: ProxyChanges | BackToEditingChange) => void,
  state: S,
): S {
  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers, proxyAddress$, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'progressProxy',
        }),
    }
  }

  return state
}
