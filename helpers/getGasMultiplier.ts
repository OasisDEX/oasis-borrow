import { ContextConnected } from 'blockchain/network'

export function getGasMultiplier(context: ContextConnected) {
  switch (context.connectionKind) {
    case 'ledger':
    case 'trezor':
      return 1.5
    default:
      // boost it slightly for others in case there’s
      // a deviation between the estimate and the actual gas used
      return 1.5
  }
}
