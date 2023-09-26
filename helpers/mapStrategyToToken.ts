import { getTokens } from 'blockchain/tokensMetadata'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'

export function mapStrategyToToken(strategy: IStrategyConfig) {
  const tokenConfig = getTokens([strategy.name])[0]
  return {
    tokenConfig,
    strategy,
  }
}
