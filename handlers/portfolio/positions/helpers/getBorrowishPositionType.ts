import type { Vault } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

interface getBorrowishPositionTypeParams {
  apiVaults: Vault[]
  networkId: NetworkIds
  positionId: number
  protocol: LendingProtocol
}

export function getBorrowishPositionType({
  apiVaults,
  networkId,
  positionId,
  protocol,
}: getBorrowishPositionTypeParams): OmniProductType.Borrow | OmniProductType.Multiply {
  return apiVaults.filter(
    ({ chain_id, protocol: _protocol, type, vault_id }) =>
      chain_id === networkId &&
      _protocol === protocol &&
      vault_id === positionId &&
      type.toLowerCase() === OmniProductType.Multiply.toLowerCase(),
  ).length > 0
    ? OmniProductType.Multiply
    : OmniProductType.Borrow
}
