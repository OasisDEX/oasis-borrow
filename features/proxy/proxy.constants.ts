import type { ProxyState } from './proxy.types'

export const defaultProxyStage: ProxyState = {
  isProxyStage: false,
}

export const PROXY_STAGES = [
  'proxyWaitingForConfirmation',
  'proxyWaitingForApproval',
  'proxyInProgress',
  'proxyFailure',
  'proxySuccess',
] as const
