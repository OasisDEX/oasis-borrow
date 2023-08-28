import { AAVETokens, IPosition, strategies } from '@oasisdex/dma-library'
import { getTokenAddresses } from 'actions/aave-like/get-token-addresses'
import { GetOnChainPositionParams } from 'actions/aave-like/types'
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
    symbol: collateralToken as AAVETokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as AAVETokens,
    precision: getToken(debtToken).precision,
  }

  const addresses = getTokenAddresses(networkId)

  if (protocol === LendingProtocol.AaveV3) {
    return await strategies.aave.v3.view(
      {
        proxy: proxyAddress,
        collateralToken: _collateralToken,
        debtToken: _debtToken,
      },
      { addresses, provider },
    )
  }

  if (protocol === LendingProtocol.AaveV2) {
    return await strategies.aave.v2.view(
      {
        proxy: proxyAddress,
        collateralToken: _collateralToken,
        debtToken: _debtToken,
      },
      { addresses, provider },
    )
  }

  throw new Error('Protocol not supported')
}
