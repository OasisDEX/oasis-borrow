import { ADDRESS_ZERO, ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import * as savingsDai from 'blockchain/abi/savings-dai.json'
import { getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { contractDesc } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'

const { mainnet } = ADDRESSES

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
] as const

export const tokensMainnet = {
  ...getCollateralTokens({ ...mainnet.maker.pips, ...mainnet.common }, supportedIlks),
  AJNA: contractDesc(erc20, mainnet.common.AJNA),
  CBETH: contractDesc(erc20, mainnet.common.CBETH),
  DAI: contractDesc(erc20, mainnet.common.DAI),
  ETH: contractDesc(erc20, mainnet.common.WETH),
  // See @oasisdex/addresses package for info
  // Used to represent ETH as an ERC20 token
  ETH_ACTUAL: contractDesc(erc20, mainnet.common.ETH),
  FRAX: contractDesc(erc20, mainnet.common.FRAX),
  GHO: contractDesc(erc20, mainnet.common.GHO),
  GUNIV3DAIUSDC1: contractDesc(guniToken, mainnet.common.GUNIV3DAIUSDC1),
  GUNIV3DAIUSDC2: contractDesc(guniToken, mainnet.common.GUNIV3DAIUSDC2),
  LINK: contractDesc(erc20, mainnet.common.LINK),
  LDO: contractDesc(erc20, mainnet.common.LDO),
  LUSD: contractDesc(erc20, mainnet.common.LUSD),
  MKR: contractDesc(erc20, mainnet.maker.common.McdGov),
  MORPHO: contractDesc(erc20, mainnet.common.MORPHO),
  RENBTC: contractDesc(erc20, mainnet.common.RENBTC),
  RETH: contractDesc(erc20, mainnet.common.RETH),
  RBN: contractDesc(erc20, mainnet.common.RBN),
  OSETH: contractDesc(erc20, mainnet.common.OSETH),
  RPL: contractDesc(erc20, mainnet.common.RPL),
  SDAI: contractDesc(savingsDai, mainnet.common.SDAI),
  STETH: contractDesc(erc20, mainnet.common.STETH),
  STYETH: contractDesc(erc20, mainnet.common.STYETH),
  SUSDE: contractDesc(erc20, mainnet.common.SUSDE),
  USDE: contractDesc(erc20, mainnet.common.USDE),
  TBTC: contractDesc(erc20, mainnet.common.TBTC),
  USDC: contractDesc(erc20, mainnet.common.USDC),
  USDT: contractDesc(erc20, mainnet.common.USDT),
  USDP: contractDesc(erc20, mainnet.common.PAXUSD),
  USDBC: contractDesc(erc20, ADDRESS_ZERO),
  'USDC.E': contractDesc(erc20, ADDRESS_ZERO),
  WBTC: contractDesc(erc20, mainnet.common.WBTC),
  WETH: contractDesc(erc20, mainnet.common.WETH),
  WEETH: contractDesc(erc20, mainnet.common.WEETH),
  WLD: contractDesc(erc20, mainnet.common.WLD),
  WSTETH: contractDesc(erc20, mainnet.common.WSTETH),
  YIELDBTC: contractDesc(erc20, mainnet.common.YIELDBTC),
  YIELDETH: contractDesc(erc20, mainnet.common.YIELDETH),
  CSETH: contractDesc(erc20, mainnet.common.CSETH),
  DETH: contractDesc(erc20, mainnet.common.DETH),
  EZETH: contractDesc(erc20, mainnet.common.EZETH),
  MEVETH: contractDesc(erc20, mainnet.common.MEVETH),
  MPETH: contractDesc(erc20, mainnet.common.MPETH),
  UNIETH: contractDesc(erc20, mainnet.common.UNIETH),
  XETH: contractDesc(erc20, mainnet.common.XETH),
  PYUSD: contractDesc(erc20, mainnet.common.PYUSD),
  CRVUSD: contractDesc(erc20, mainnet.common.CRVUSD),
  AETHSDAI: contractDesc(erc20, mainnet.common.AETHSDAI),
  AETHUSDC: contractDesc(erc20, mainnet.common.AETHUSDC),
  AETHUSDT: contractDesc(erc20, mainnet.common.AETHUSDT),
  AETHDAI: contractDesc(erc20, mainnet.common.AETHDAI),
  AETHPYUSD: contractDesc(erc20, mainnet.common.AETHPYUSD),
  AETHLUSD: contractDesc(erc20, mainnet.common.AETHLUSD),
  AUSDC: contractDesc(erc20, mainnet.common.AUSDC),
  AUSDT: contractDesc(erc20, mainnet.common.AUSDT),
  CUSDCV3: contractDesc(erc20, mainnet.common.CUSDCV3),
  CDAI: contractDesc(erc20, mainnet.common.CDAI),
  CUSDC: contractDesc(erc20, mainnet.common.CUSDC),
  AETHWSTETH: contractDesc(erc20, mainnet.common.AETHWSTETH),
  AETHWETH: contractDesc(erc20, mainnet.common.AETHWETH),
  AETHRETH: contractDesc(erc20, mainnet.common.AETHRETH),
  AETHCBETH: contractDesc(erc20, mainnet.common.AETHCBETH),
  ASETH: contractDesc(erc20, mainnet.common.ASETH),
  AWETH: contractDesc(erc20, mainnet.common.AWETH),
  CETH: contractDesc(erc20, mainnet.common.CETH),
  CWETHV3: contractDesc(erc20, mainnet.common.CWETHV3),
  AETHWBTC: contractDesc(erc20, mainnet.common.AETHWBTC),
  AWBTC: contractDesc(erc20, mainnet.common.AWBTC),
} as Record<string, ContractDesc>

export const ilksNotSupportedOnGoerli = ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'] as const

export const ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET = 16183119
export const AAVE_V3_POOL_GENESIS_MAINNET = 16291127
export const AAVE_V2_LENDING_POOL_GENESIS_MAINNET = 11362579

export const SPARK_V3_LENDING_POOL_GENESIS_MAINNET = 16776401
export const SPARK_V3_ORACLE_GENESIS_MAINNET = 16776437
export const SPARK_V3_POOL_DATA_PROVIDER_GENESIS_MAINNET = 16776391
