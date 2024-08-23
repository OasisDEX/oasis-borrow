import { LendingProtocol } from 'lendingProtocols'

export const TOKENS_MEME = ['DOGE', 'MEME']
export const TOKENS_STABLE_GROUPS = ['DAI', 'FRAX', 'LUSD', 'SUSDE', 'USDC', 'USDT']
export const TOKENS_WITH_RESTAKING = ['EZETH', 'WEETH', 'RSETH']
export const TOKENS_WITH_STAKING_REWARDS = ['APXETH', 'CBETH', 'OSETH', 'RETH', 'STYETH', 'WSTETH']
export const TOKENS_BLUECHIP = [
  'CBETH',
  'DAI',
  'ETH',
  'LDO',
  'LINK',
  'MKR',
  'RETH',
  'SDAI',
  'STETH',
  'USDC',
  'USDT',
  'WBTC',
  'WSTETH',
]

export const PROTOCOLS_TVL_GT_1B = [
  LendingProtocol.AaveV2,
  LendingProtocol.AaveV3,
  LendingProtocol.Maker,
  LendingProtocol.MorphoBlue,
  LendingProtocol.SparkV3,
]
export const PROTOCOLS_ISOLATED_PAIRS = [LendingProtocol.Ajna, LendingProtocol.MorphoBlue]
export const PROTOCOLS_LONGEVITY = [
  LendingProtocol.AaveV2,
  LendingProtocol.AaveV3,
  LendingProtocol.Maker,
  LendingProtocol.MorphoBlue,
]
