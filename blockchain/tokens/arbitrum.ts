import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import { getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { contractDesc } from 'blockchain/networks'
import { ContractDesc } from 'features/web3Context'

import { supportedIlks } from './mainnet'

export const AAVE_V3_POOL_GENESIS_GOERLI = 4365693

const { arbitrum } = ADDRESSES

export const tokensArbitrum = {
  ...getCollateralTokens({ ...arbitrum.maker.pips, ...arbitrum.common }, supportedIlks),
  CBETH: contractDesc(erc20, arbitrum.common.CBETH),
  CRVV1ETHSTETH: contractDesc(guniToken, arbitrum.common.CRVV1ETHSTETH),
  DAI: contractDesc(erc20, arbitrum.common.DAI),
  GHO: contractDesc(erc20, arbitrum.common.GHO),
  GUNIV3DAIUSDC1: contractDesc(guniToken, arbitrum.common.GUNIV3DAIUSDC1),
  GUNIV3DAIUSDC2: contractDesc(guniToken, arbitrum.common.GUNIV3DAIUSDC2),
  LDO: contractDesc(erc20, arbitrum.common.LDO),
  MKR: contractDesc(erc20, arbitrum.maker.common.McdGov),
  RENBTC: contractDesc(erc20, arbitrum.common.RENBTC),
  STETH: contractDesc(erc20, arbitrum.common.STETH),
  USDC: contractDesc(erc20, arbitrum.common.USDC),
  USDP: contractDesc(erc20, arbitrum.common.PAXUSD),
  WBTC: contractDesc(erc20, arbitrum.common.WBTC),
  WETH: contractDesc(erc20, arbitrum.common.WETH),
  WLD: contractDesc(erc20, arbitrum.common.WLD),
  WSTETH: contractDesc(erc20, arbitrum.common.WSTETH),
} as Record<string, ContractDesc>
