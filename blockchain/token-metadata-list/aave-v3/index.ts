import { TokenConfig } from 'blockchain/tokensMetadata'

import { aaveV3ArbitrumTokensMetadata } from './aave-v3-arbitrum'
import { aaveV3EthereumTokensMetadata } from './aave-v3-ethereum'
import { aaveV3OptimismTokensMetadata } from './aave-v3-optimism'

export const aaveV3TokensMetadata: TokenConfig[] = [
  ...aaveV3EthereumTokensMetadata,
  ...aaveV3OptimismTokensMetadata,
  ...aaveV3ArbitrumTokensMetadata,
]
