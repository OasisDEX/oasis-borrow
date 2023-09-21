import type { ContextConnected } from 'blockchain/network.types'

export function getGasMultiplier(context: ContextConnected) {
  switch (context.walletLabel) {
    case 'ledger':
    case 'trezor':
      return 1.5
    default:
      // boost it slightly for others in case there’s
      // a deviation between the estimate and the actual gas used
      // TODO: have these be configurable without a code change
      return 1.25
  }
}
