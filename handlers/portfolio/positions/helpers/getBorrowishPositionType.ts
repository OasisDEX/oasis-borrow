import type { Vault } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

interface getBorrowishPositionTypeParams {
  apiVaults: Vault[]
  defaultType?: OmniProductBorrowishType
  networkId: NetworkIds
  positionId: number
  protocol: LendingProtocol
}

export function getBorrowishPositionType({
  apiVaults,
  defaultType,
  networkId,
  positionId,
  protocol,
}: getBorrowishPositionTypeParams): OmniProductBorrowishType {
  const [apiVault] = apiVaults.filter(
    ({ chain_id, protocol: _protocol, vault_id }) =>
      chain_id === networkId && _protocol.toLowerCase() === protocol.toLowerCase() && vault_id === positionId,
  )

  return apiVault
    ? (apiVault.type as OmniProductBorrowishType)
    : defaultType ?? OmniProductType.Borrow
}
