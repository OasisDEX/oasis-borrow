import { ContextConnected } from 'blockchain/network'

export function getGasMultiplier(context: ContextConnected) {
  switch (context.connectionKind) {
    case 'ledger':
    case 'trezor':
      return 1.5
    default:
      return 1
  }
}
