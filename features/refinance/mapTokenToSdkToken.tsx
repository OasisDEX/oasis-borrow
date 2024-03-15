import { type ChainInfo, Token } from '@summerfi/sdk-common/dist/common'
import { getNetworkContracts } from 'blockchain/contracts'
import { getTokenMetaData } from 'features/exchange/exchange'

export function mapTokenToSdkToken(chainInfo: ChainInfo, token: string): Token {
  const contracts = getNetworkContracts(chainInfo.chainId)
  const tokenMeta = getTokenMetaData(token, contracts)

  return Token.createFrom({
    symbol: tokenMeta.symbol,
    address: tokenMeta.address,
    name: tokenMeta.name,
    decimals: tokenMeta.decimals,
    chainInfo: chainInfo,
  })
}
