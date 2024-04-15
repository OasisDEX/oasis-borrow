import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import { contractDesc } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'

export const AAVE_V3_POOL_GENESIS_GOERLI = 4365693

const { arbitrum } = ADDRESSES

export const tokensArbitrum = {
  ETH: contractDesc(erc20, arbitrum.common.WETH),
  ETH_ACTUAL: contractDesc(erc20, arbitrum.common.ETH),
  ARB: contractDesc(erc20, arbitrum.common.ARB),
  CBETH: contractDesc(erc20, arbitrum.common.CBETH),
  DAI: contractDesc(erc20, arbitrum.common.DAI),
  FRAX: contractDesc(erc20, arbitrum.common.FRAX),
  GHO: contractDesc(erc20, arbitrum.common.GHO),
  LDO: contractDesc(erc20, arbitrum.common.LDO),
  LUSD: contractDesc(erc20, arbitrum.common.LUSD),
  RENBTC: contractDesc(erc20, arbitrum.common.RENBTC),
  RETH: contractDesc(erc20, arbitrum.common.RETH),
  SDAI: contractDesc(erc20, arbitrum.common.SDAI),
  WEETH: contractDesc(erc20, arbitrum.common.WEETH),
  USDE: contractDesc(erc20, arbitrum.common.USDE),
  STETH: contractDesc(erc20, arbitrum.common.STETH),
  STYETH: contractDesc(erc20, arbitrum.common.STYETH),
  TBTC: contractDesc(erc20, arbitrum.common.TBTC),
  USDC: contractDesc(erc20, arbitrum.common.USDC),
  'USDC.E': contractDesc(erc20, arbitrum.common['USDC.E']),
  USDT: contractDesc(erc20, arbitrum.common.USDT),
  USDP: contractDesc(erc20, arbitrum.common.PAXUSD),
  WBTC: contractDesc(erc20, arbitrum.common.WBTC),
  WETH: contractDesc(erc20, arbitrum.common.WETH),
  WLD: contractDesc(erc20, arbitrum.common.WLD),
  WSTETH: contractDesc(erc20, arbitrum.common.WSTETH),
  YIELDBTC: contractDesc(erc20, arbitrum.common.YIELDBTC),
  YIELDETH: contractDesc(erc20, arbitrum.common.YIELDETH),
} as Record<string, ContractDesc>
