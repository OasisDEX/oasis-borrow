import { BaseAaveContext } from 'features/aave/common/BaseAaveContext'

export function isUserWalletConnected(context: BaseAaveContext) {
  return context.web3Context && context.web3Context?.status === 'connected'
}
