import { assign } from 'xstate'

import { GasEstimationStatus } from '../../../helpers/form'
import { ProxyContext, ProxyEvent } from './types'

const initGasData = assign<ProxyContext, ProxyEvent>(() => ({
  gasData: { gasEstimationStatus: GasEstimationStatus.calculating },
}))

const assignGasCostData = assign<ProxyContext, ProxyEvent>((_, event) => {
  if (event.type !== 'GAS_COST_ESTIMATION') return {}
  return {
    gasData: event.gasData,
  }
})

const assignProxyConfirmations = assign<ProxyContext, ProxyEvent>((_, event) => {
  if (event.type !== 'CONFIRMED') return {}
  return {
    proxyConfirmations: event.proxyConfirmations,
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
  assignProxyConfirmations,
  assignTxHash,
  assignProxyAddress,
  assignTxError,
}
