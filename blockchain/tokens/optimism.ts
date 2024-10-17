import { ADDRESS_ZERO, ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import { contractDesc } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'

export const AAVE_V3_POOL_GENESIS_OPTIMISM_MAINNET = 4365693
export const ACCOUNT_GUARD_GENESIS_OPTIMISM_MAINNET = 84955123
export const ACCOUNT_FACTORY_GENESIS_OPTIMISM_MAINNET = 84955175

const { optimism } = ADDRESSES

export const tokensOptimism = {
  CBETH: contractDesc(erc20, optimism.common.CBETH),
  CBBTC: contractDesc(erc20, ADDRESS_ZERO),
  ETH_ACTUAL: contractDesc(erc20, optimism.common.ETH),
  OP: contractDesc(erc20, optimism.common.OP),
  DAI: contractDesc(erc20, optimism.common.DAI),
  ETH: contractDesc(erc20, optimism.common.WETH),
  FRAX: contractDesc(erc20, optimism.common.FRAX),
  GHO: contractDesc(erc20, optimism.common.GHO),
  LDO: contractDesc(erc20, optimism.common.LDO),
  WEETH: contractDesc(erc20, optimism.common.WEETH),
  LUSD: contractDesc(erc20, optimism.common.LUSD),
  RETH: contractDesc(erc20, optimism.common.RETH),
  RENBTC: contractDesc(erc20, optimism.common.RENBTC),
  SDAI: contractDesc(erc20, optimism.common.SDAI),
  SUSD: contractDesc(erc20, optimism.common.SUSD),
  STETH: contractDesc(erc20, optimism.common.STETH),
  STYETH: contractDesc(erc20, optimism.common.STYETH),
  TBTC: contractDesc(erc20, optimism.common.TBTC),
  USDT: contractDesc(erc20, optimism.common.USDT),
  'USDC.E': contractDesc(erc20, optimism.common['USDC.E']),
  USDE: contractDesc(erc20, optimism.common.USDE),
  USDC: contractDesc(erc20, optimism.common.USDC),
  USDP: contractDesc(erc20, optimism.common.PAXUSD),
  WBTC: contractDesc(erc20, optimism.common.WBTC),
  WETH: contractDesc(erc20, optimism.common.WETH),
  WLD: contractDesc(erc20, optimism.common.WLD),
  WSTETH: contractDesc(erc20, optimism.common.WSTETH),
  WOETH: contractDesc(erc20, optimism.common.WOETH),
  YIELDBTC: contractDesc(erc20, optimism.common.YIELDBTC),
  YIELDETH: contractDesc(erc20, optimism.common.YIELDETH),
} as Record<string, ContractDesc>
