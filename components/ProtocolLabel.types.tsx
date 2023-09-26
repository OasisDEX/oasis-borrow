import type { NetworkNames } from 'blockchain/networks'
import type { LendingProtocol } from 'lendingProtocols'

export interface ProtocolLabelProps {
  network: NetworkNames
  protocol: LendingProtocol
}
