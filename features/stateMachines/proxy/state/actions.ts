import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { assign } from 'xstate'

import type { ProxyContext, ProxyEvent } from './types'

const initGasData = assign<ProxyContext, ProxyEvent>(() => ({
  gasData: { gasEstimationStatus: GasEstimationStatus.calculating },
}))

const assignGasCostData = assign<ProxyContext, ProxyEvent>((_, event) => {
  if (event.type !== 'GAS_COST_ESTIMATION') return {}
  return {
    gasData: event.gasData,
  }
})

const assignContextConnected = assign<ProxyContext, ProxyEvent>((_, event) => {
  if (event.type !== 'CONNECTED_CONTEXT_CHANGED') return {}
  return {
    contextConnected: event.contextConnected,
  }
})

const assignTxHelper = assign<ProxyContext, ProxyEvent>((_, event) => {
  if (event.type !== 'TX_HELPERS_CHANGED') return {}
  return {
    txHelpers: event.txHelpers,
  }
})

const assignTxHash = assign<ProxyContext, ProxyEvent>((_, event) => {
  if (event.type !== 'IN_PROGRESS') return {}
  return {
    txHash: event.proxyTxHash,
  }
})

const assignProxyAddress = assign<ProxyContext, ProxyEvent>((_, event) => {
  if (event.type !== 'SUCCESS') return {}
  return {
    proxyAddress: event.proxyAddress,
  }
})

const assignTxError = assign<ProxyContext, ProxyEvent>((_, event) => {
  if (event.type !== 'FAILURE') return {}
  return {
    txError: event.txError,
  }
})

export const actions = {
  initGasData,
  assignGasCostData,
  assignContextConnected,
  assignTxHelper,
  assignTxHash,
  assignProxyAddress,
  assignTxError,
}
