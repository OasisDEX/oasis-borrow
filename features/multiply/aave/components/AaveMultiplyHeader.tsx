import { StrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import React from 'react'

export function AaveMultiplyHeader({ strategyConfig }: { strategyConfig: StrategyConfig }) {
  return <div>multiply header{strategyConfig.name}</div>
}
