import { Address, AddressType, type ChainInfo, Token } from '@summer_fi/summerfi-sdk-common'
import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getTokenMetaData } from 'features/exchange/exchange'

export function mapTokenToSdkToken(chainInfo: ChainInfo, token: string): Token {
  const contracts = (getNetworkContracts(chainInfo.chainId as NetworkIds) as any).tokens
  const tokenMeta = getTokenMetaData(token, contracts)

  return Token.createFrom({
    symbol: tokenMeta.symbol,
    address: Address.createFrom({
      value: tokenMeta.address as `0x${string}`,
      type: AddressType.Ethereum,
    }),
    name: tokenMeta.name,
    decimals: tokenMeta.decimals,
    chainInfo: chainInfo,
  })
}
