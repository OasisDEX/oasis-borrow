import type { Vault } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

interface GetBorrowishPositionTypeParams {
  apiVaults: Vault[]
  defaultType?: OmniProductBorrowishType
  networkId: NetworkIds
  positionId: number
  protocol: LendingProtocol
  collateralToken?: string
  quoteToken?: string
}

export function getBorrowishPositionType({
  apiVaults,
  defaultType,
  networkId,
  positionId,
  protocol,
  collateralToken,
  quoteToken,
}: GetBorrowishPositionTypeParams): OmniProductBorrowishType {
  // In vault.token_pair we store WETH as ETH
  const resolveCollateralToken = collateralToken?.toUpperCase() === 'WETH' ? 'ETH' : collateralToken
  const resolveQuoteToken = quoteToken?.toUpperCase() === 'WETH' ? 'ETH' : quoteToken

  const apiVault = apiVaults.find(
    ({ chain_id, protocol: _protocol, vault_id, token_pair }) =>
      chain_id === networkId &&
      _protocol.toLowerCase() === protocol.toLowerCase() &&
      vault_id === positionId &&
      (resolveCollateralToken && resolveQuoteToken
        ? token_pair.toLowerCase() ===
          `${resolveCollateralToken.toLowerCase()}-${resolveQuoteToken.toLowerCase()}`
        : true),
  )

  return apiVault
    ? (apiVault.type as OmniProductBorrowishType)
    : defaultType ?? OmniProductType.Borrow
}
