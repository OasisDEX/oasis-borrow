import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import { contractDesc } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'

const { base } = ADDRESSES

export const tokensBase = {
  ETH: contractDesc(erc20, base.common.WETH),
  CBETH: contractDesc(erc20, base.common.CBETH),
  DAI: contractDesc(erc20, base.common.DAI),
  FRAX: contractDesc(erc20, base.common.FRAX),
  GHO: contractDesc(erc20, base.common.GHO),
  LDO: contractDesc(erc20, base.common.LDO),
  LUSD: contractDesc(erc20, base.common.LUSD),
  RENBTC: contractDesc(erc20, base.common.RENBTC),
  RETH: contractDesc(erc20, base.common.RETH),
  SDAI: contractDesc(erc20, base.common.SDAI),
  STETH: contractDesc(erc20, base.common.STETH),
  TBTC: contractDesc(erc20, base.common.TBTC),
  USDC: contractDesc(erc20, base.common.USDC),
  USDT: contractDesc(erc20, base.common.USDT),
  USDP: contractDesc(erc20, base.common.PAXUSD),
  WBTC: contractDesc(erc20, base.common.WBTC),
  WETH: contractDesc(erc20, base.common.WETH),
  WLD: contractDesc(erc20, base.common.WLD),
  WSTETH: contractDesc(erc20, base.common.WSTETH),
  YIELDBTC: contractDesc(erc20, base.common.YIELDBTC),
  YIELDETH: contractDesc(erc20, base.common.YIELDETH),
} as Record<string, ContractDesc>
