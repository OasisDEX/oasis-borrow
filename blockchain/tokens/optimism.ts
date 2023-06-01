import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import { getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { contractDesc } from 'blockchain/networks'
import { ContractDesc } from 'features/web3Context'

import { supportedIlks } from './mainnet'

export const AAVE_V3_POOL_GENESIS_OPTIMISM_MAINNET = 4365693
export const ACCOUNT_GUARD_GENESIS_OPTIMISM_MAINNET = 84955123
export const ACCOUNT_FACTORY_GENESIS_OPTIMISM_MAINNET = 84955175

const { optimism } = ADDRESSES

export const tokensOptimism = {
  ...getCollateralTokens({ ...optimism.maker.pips, ...optimism.common }, supportedIlks),
  GUNIV3DAIUSDC1: contractDesc(guniToken, optimism.common.GUNIV3DAIUSDC1),
  GUNIV3DAIUSDC2: contractDesc(guniToken, optimism.common.GUNIV3DAIUSDC2),
  CRVV1ETHSTETH: contractDesc(guniToken, optimism.common.CRVV1ETHSTETH),
  DAI: contractDesc(erc20, optimism.common.DAI),
  LDO: contractDesc(erc20, optimism.common.LDO),
  MKR: contractDesc(erc20, optimism.maker.common.McdGov),
  STETH: contractDesc(erc20, optimism.common.STETH),
  USDP: contractDesc(erc20, optimism.common.PAXUSD),
  WSTETH: contractDesc(erc20, optimism.common.WSTETH),
  WETH: contractDesc(erc20, optimism.common.WETH),
  USDC: contractDesc(erc20, optimism.common.USDC),
  WBTC: contractDesc(erc20, optimism.common.WBTC),
  RENBTC: contractDesc(erc20, optimism.common.RENBTC),
  CBETH: contractDesc(erc20, optimism.common.CBETH),
} as Record<string, ContractDesc>
