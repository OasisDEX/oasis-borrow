import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import { getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { contractDesc } from 'blockchain/networksConfig'
import { ContractDesc } from 'features/web3Context'
import { Dictionary } from 'ts-essentials'

const { mainnet } = ADDRESSES

export const charterIlks = ['INST-ETH-A', 'INST-WBTC-A']

export const cropJoinIlks = ['CRVV1ETHSTETH-A']

export const supportedIlks = [
  /* export just for test purposes */ 'ETH-A',
  'ETH-B',
  'ETH-C',
  'BAT-A',
  'DAI',
  'USDC-A',
  'USDC-B',
  'WBTC-A',
  'RENBTC-A',
  'TUSD-A',
  'ZRX-A',
  'KNC-A',
  'MANA-A',
  'USDT-A',
  'PAXUSD-A',
  'COMP-A',
  'LRC-A',
  'LINK-A',
  'BAL-A',
  'YFI-A',
  'GUSD-A',
  'UNI-A',
  'AAVE-A',
  'UNIV2DAIETH-A',
  'UNIV2WBTCETH-A',
  'UNIV2USDCETH-A',
  'UNIV2DAIUSDC-A',
  'UNIV2ETHUSDT-A',
  'UNIV2LINKETH-A',
  'UNIV2UNIETH-A',
  'UNIV2WBTCDAI-A',
  'UNIV2AAVEETH-A',
  'UNIV2DAIUSDT-A',
  'MATIC-A',
  'GUNIV3DAIUSDC1-A',
  'GUNIV3DAIUSDC2-A',
  'WSTETH-A',
  'WBTC-B',
  'WBTC-C',
  'WSTETH-B',
  'RETH-A',
  'GNO-A',
  ...charterIlks,
  ...cropJoinIlks,
] as const

export const tokensMainnet = {
  ...getCollateralTokens({ ...mainnet.maker.pips, ...mainnet.common }, supportedIlks),
  GUNIV3DAIUSDC1: contractDesc(guniToken, mainnet.common.GUNIV3DAIUSDC1),
  GUNIV3DAIUSDC2: contractDesc(guniToken, mainnet.common.GUNIV3DAIUSDC2),
  CRVV1ETHSTETH: contractDesc(guniToken, mainnet.common.CRVV1ETHSTETH),
  DAI: contractDesc(erc20, mainnet.common.DAI),
  LDO: contractDesc(erc20, mainnet.common.LDO),
  MKR: contractDesc(erc20, mainnet.maker.common.McdGov),
  STETH: contractDesc(erc20, mainnet.common.STETH),
  USDP: contractDesc(erc20, mainnet.common.PAXUSD),
  WSTETH: contractDesc(erc20, mainnet.common.WSTETH),
  WETH: contractDesc(erc20, mainnet.common.WETH),
  USDC: contractDesc(erc20, mainnet.common.USDC),
  WBTC: contractDesc(erc20, mainnet.common.WBTC),
  RENBTC: contractDesc(erc20, mainnet.common.RENBTC),
} as Dictionary<ContractDesc>

export const ilksNotSupportedOnGoerli = [
  'GUNIV3DAIUSDC1-A',
  'GUNIV3DAIUSDC2-A',
  ...charterIlks,
  ...cropJoinIlks,
] as const

export const ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET = 16183119
export const AAVE_V3_POOL_GENESIS_MAINNET = 16291127
export const AAVE_V2_LENDING_POOL_GENESIS_MAINNET = 11362579
