import type { TokenConfig } from 'blockchain/TokenConfig'
import { tokensBySymbol } from 'blockchain/tokensMetadata.constants'

export const getOmniUnderlyingToken = (tokenSymbol: TokenConfig['symbol']) => {
  return tokensBySymbol[tokenSymbol]?.rootToken || tokenSymbol
}
