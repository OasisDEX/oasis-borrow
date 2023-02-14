import { getTokens } from 'blockchain/tokensMetadata'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'

export function mapStrategyToToken(strategy: IStrategyConfig) {
  const tokenConfig = getTokens([strategy.name])[0]
  return {
    tokenConfig,
    strategy,
  }
}
