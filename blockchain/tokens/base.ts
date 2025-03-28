import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import { contractDesc } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'

const { base } = ADDRESSES

export const tokensBase = {
  ETH: contractDesc(erc20, base.common.WETH),
  ETH_ACTUAL: contractDesc(erc20, base.common.ETH),
  CBETH: contractDesc(erc20, base.common.CBETH),
  CBBTC: contractDesc(erc20, base.common.CBBTC),
  DAI: contractDesc(erc20, base.common.DAI),
  FRAX: contractDesc(erc20, base.common.FRAX),
  GHO: contractDesc(erc20, base.common.GHO),
  LDO: contractDesc(erc20, base.common.LDO),
  LUSD: contractDesc(erc20, base.common.LUSD),
  RENBTC: contractDesc(erc20, base.common.RENBTC),
  WEETH: contractDesc(erc20, base.common.WEETH),
  RETH: contractDesc(erc20, base.common.RETH),
  SDAI: contractDesc(erc20, base.common.SDAI),
  STETH: contractDesc(erc20, base.common.STETH),
  STYETH: contractDesc(erc20, base.common.STYETH),
  TBTC: contractDesc(erc20, base.common.TBTC),
  USDC: contractDesc(erc20, base.common.USDC),
  USDE: contractDesc(erc20, base.common.USDE),
  USDBC: contractDesc(erc20, base.common.USDBC),
  USDT: contractDesc(erc20, base.common.USDT),
  USDP: contractDesc(erc20, base.common.PAXUSD),
  WBTC: contractDesc(erc20, base.common.WBTC),
  WETH: contractDesc(erc20, base.common.WETH),
  WLD: contractDesc(erc20, base.common.WLD),
  WSTETH: contractDesc(erc20, base.common.WSTETH),
  WOETH: contractDesc(erc20, base.common.WOETH),
  YIELDBTC: contractDesc(erc20, base.common.YIELDBTC),
  YIELDETH: contractDesc(erc20, base.common.YIELDETH),
  DEGEN: contractDesc(erc20, base.common.DEGEN),
  CUSDCV3: contractDesc(erc20, base.common.CUSDCV3),
  SNX: contractDesc(erc20, base.common.SNX),
  AERO: contractDesc(erc20, base.common.AERO),
  PRIME: contractDesc(erc20, base.common.PRIME),
  EZETH: contractDesc(erc20, base.common.EZETH),
  BSDETH: contractDesc(erc20, base.common.BSDETH),
  WSUPEROETHB: contractDesc(erc20, base.common.WSUPEROETHB),
  EURC: contractDesc(erc20, base.common.EURC),
  MORPHO: contractDesc(erc20, base.common.MORPHO),
  MORPHO_LEGACY: contractDesc(erc20, base.common.MORPHO_LEGACY),
} as Record<string, ContractDesc>
