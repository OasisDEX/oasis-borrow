import { networkSetById } from 'blockchain/networks'
import { BaseAaveContext } from 'features/aave/common/BaseAaveContext'

export function isUserWalletConnected(context: BaseAaveContext) {
  return context.web3Context && context.web3Context?.status === 'connected'
}

export function isConnectedToCorrectNetwork(context: BaseAaveContext) {
  const connectedChainId = context.web3Context?.chainId
  if (!connectedChainId) return false

  const networkConfig = networkSetById[connectedChainId]
  if (networkConfig.isCustomFork && networkConfig.mainnetId === context.strategyConfig.networkId)
    return true
  return context.web3Context && context.web3Context?.chainId === context.strategyConfig.networkId
}
export function getConnectedChainId(context: BaseAaveContext) {
  return context.web3Context?.chainId
}
