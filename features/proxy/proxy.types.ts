import type { TxError } from 'helpers/types'

import type { PROXY_STAGES } from './proxy.constants'

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
export interface Dependencies {
  stage: string
  token: string
  safeConfirmations: number
}

export type ProxyStages = (typeof PROXY_STAGES)[number]

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
export type BackToEditingChange = { kind: 'backToEditing' }
