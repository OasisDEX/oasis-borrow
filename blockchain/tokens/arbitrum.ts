import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import { contractDesc } from 'blockchain/networks'
import { ContractDesc } from 'features/web3Context'

export const AAVE_V3_POOL_GENESIS_GOERLI = 4365693

const { arbitrum } = ADDRESSES

export const tokensArbitrum = {
  ETH: contractDesc(erc20, arbitrum.common.WETH),
  CBETH: contractDesc(erc20, arbitrum.common.CBETH),
  CRVV1ETHSTETH: contractDesc(guniToken, arbitrum.common.CRVV1ETHSTETH),
  DAI: contractDesc(erc20, arbitrum.common.DAI),
  FRAX: contractDesc(erc20, arbitrum.common.FRAX),
  GHO: contractDesc(erc20, arbitrum.common.GHO),
  GUNIV3DAIUSDC1: contractDesc(guniToken, arbitrum.common.GUNIV3DAIUSDC1),
  GUNIV3DAIUSDC2: contractDesc(guniToken, arbitrum.common.GUNIV3DAIUSDC2),
  LDO: contractDesc(erc20, arbitrum.common.LDO),
  LUSD: contractDesc(erc20, arbitrum.common.LUSD),
  MKR: contractDesc(erc20, arbitrum.maker.common.McdGov),
  RETH: contractDesc(erc20, arbitrum.common.RETH),
  RENBTC: contractDesc(erc20, arbitrum.common.RENBTC),
  RETH: contractDesc(erc20, arbitrum.common.RETH),
  SDAI: contractDesc(erc20, arbitrum.common.SDAI),
  STETH: contractDesc(erc20, arbitrum.common.STETH),
  TBTC: contractDesc(erc20, arbitrum.common.TBTC),
  USDC: contractDesc(erc20, arbitrum.common.USDC),
  USDP: contractDesc(erc20, arbitrum.common.PAXUSD),
  WBTC: contractDesc(erc20, arbitrum.common.WBTC),
  WETH: contractDesc(erc20, arbitrum.common.WETH),
  WLD: contractDesc(erc20, arbitrum.common.WLD),
  WSTETH: contractDesc(erc20, arbitrum.common.WSTETH),
  YIELDBTC: contractDesc(erc20, arbitrum.common.YIELDBTC),
  YIELDETH: contractDesc(erc20, arbitrum.common.YIELDETH),
} as Record<string, ContractDesc>
