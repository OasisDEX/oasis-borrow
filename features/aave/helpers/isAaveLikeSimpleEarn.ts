import type { IStrategyConfig } from 'features/aave/types'

// if all tokens are the same, it's a simple earn
export const isAaveLikeSimpleEarn = ({ tokens: { collateral, debt, deposit } }: IStrategyConfig) =>
  new Set([collateral, debt, deposit]).size === 1
