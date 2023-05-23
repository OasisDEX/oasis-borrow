import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import { getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { contractDesc } from 'blockchain/networksConfig'
import { ContractDesc } from 'features/web3Context'

import { supportedIlks } from './mainnet'

export const AAVE_V3_POOL_GENESIS_GOERLI = 4365693

const { arbitrum } = ADDRESSES

export const tokensArbitrum = {
  ...getCollateralTokens({ ...arbitrum.maker.pips, ...arbitrum.common }, supportedIlks),
  GUNIV3DAIUSDC1: contractDesc(guniToken, arbitrum.common.GUNIV3DAIUSDC1),
  GUNIV3DAIUSDC2: contractDesc(guniToken, arbitrum.common.GUNIV3DAIUSDC2),
  CRVV1ETHSTETH: contractDesc(guniToken, arbitrum.common.CRVV1ETHSTETH),
  DAI: contractDesc(erc20, arbitrum.common.DAI),
  LDO: contractDesc(erc20, arbitrum.common.LDO),
  MKR: contractDesc(erc20, arbitrum.maker.common.McdGov),
  STETH: contractDesc(erc20, arbitrum.common.STETH),
  USDP: contractDesc(erc20, arbitrum.common.PAXUSD),
  WSTETH: contractDesc(erc20, arbitrum.common.WSTETH),
  WETH: contractDesc(erc20, arbitrum.common.WETH),
  USDC: contractDesc(erc20, arbitrum.common.USDC),
  WBTC: contractDesc(erc20, arbitrum.common.WBTC),
  RENBTC: contractDesc(erc20, arbitrum.common.RENBTC),
  CBETH: contractDesc(erc20, arbitrum.common.CBETH),
} as Record<string, ContractDesc>
