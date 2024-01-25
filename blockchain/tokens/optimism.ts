import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import { contractDesc } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'

export const AAVE_V3_POOL_GENESIS_OPTIMISM_MAINNET = 4365693
export const ACCOUNT_GUARD_GENESIS_OPTIMISM_MAINNET = 84955123
export const ACCOUNT_FACTORY_GENESIS_OPTIMISM_MAINNET = 84955175

const { optimism } = ADDRESSES

export const tokensOptimism = {
  CBETH: contractDesc(erc20, optimism.common.CBETH),
  DAI: contractDesc(erc20, optimism.common.DAI),
  ETH: contractDesc(erc20, optimism.common.WETH),
  FRAX: contractDesc(erc20, optimism.common.FRAX),
  GHO: contractDesc(erc20, optimism.common.GHO),
  LDO: contractDesc(erc20, optimism.common.LDO),
  LUSD: contractDesc(erc20, optimism.common.LUSD),
  RETH: contractDesc(erc20, optimism.common.RETH),
  RENBTC: contractDesc(erc20, optimism.common.RENBTC),
  SDAI: contractDesc(erc20, optimism.common.SDAI),
  STETH: contractDesc(erc20, optimism.common.STETH),
  STYETH: contractDesc(erc20, optimism.common.STYETH),
  TBTC: contractDesc(erc20, optimism.common.TBTC),
  USDT: contractDesc(erc20, optimism.common.USDT),
  'USDC.E': contractDesc(erc20, optimism.common['USDC.E']),
  USDC: contractDesc(erc20, optimism.common.USDC),
  USDP: contractDesc(erc20, optimism.common.PAXUSD),
  WBTC: contractDesc(erc20, optimism.common.WBTC),
  WETH: contractDesc(erc20, optimism.common.WETH),
  WLD: contractDesc(erc20, optimism.common.WLD),
  WSTETH: contractDesc(erc20, optimism.common.WSTETH),
  YIELDBTC: contractDesc(erc20, optimism.common.YIELDBTC),
  YIELDETH: contractDesc(erc20, optimism.common.YIELDETH),
} as Record<string, ContractDesc>
