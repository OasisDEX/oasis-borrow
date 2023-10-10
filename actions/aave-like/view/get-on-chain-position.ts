import type { IPosition, Tokens } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import type { GetOnChainPositionParams } from 'actions/aave-like/types'
import { getRpcProvider } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { LendingProtocol } from 'lendingProtocols'

export async function getOnChainPosition({
  networkId,
  proxyAddress,
  collateralToken,
  debtToken,
  protocol,
}: GetOnChainPositionParams): Promise<IPosition> {
  const provider = getRpcProvider(networkId)

  const _collateralToken = {
    symbol: collateralToken as Tokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as Tokens,
    precision: getToken(debtToken).precision,
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      const addressesV2 = getAddresses(networkId, LendingProtocol.AaveV2)
      return await views.aave.v2(
        {
          proxy: proxyAddress,
          collateralToken: _collateralToken,
          debtToken: _debtToken,
        },
        { addresses: addressesV2, provider },
      )
    case LendingProtocol.AaveV3:
      const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
      return await views.aave.v3(
        {
          proxy: proxyAddress,
          collateralToken: _collateralToken,
          debtToken: _debtToken,
        },
        { addresses: addressesV3, provider },
      )
    case LendingProtocol.SparkV3:
      const addressesSpark = getAddresses(networkId, LendingProtocol.SparkV3)
      return await views.spark(
        {
          proxy: proxyAddress,
          collateralToken: _collateralToken,
          debtToken: _debtToken,
        },
        { addresses: addressesSpark, provider },
      )
    default:
      throw new Error('Protocol not supported')
  }
}
