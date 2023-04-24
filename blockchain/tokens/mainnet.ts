import * as eth from 'blockchain/abi/ds-eth-token.json'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import { getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { default as mainnetAddresses } from 'blockchain/addresses/mainnet.json'
import { contractDesc } from 'blockchain/networksConfig'
import { ContractDesc } from 'features/web3Context'
import { Dictionary } from 'ts-essentials'

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
  ...getCollateralTokens(mainnetAddresses, supportedIlks),
  GUNIV3DAIUSDC1: contractDesc(guniToken, mainnetAddresses['GUNIV3DAIUSDC1']),
  GUNIV3DAIUSDC2: contractDesc(guniToken, mainnetAddresses['GUNIV3DAIUSDC2']),
  WETH: contractDesc(eth, mainnetAddresses['ETH']),
  DAI: contractDesc(erc20, mainnetAddresses['MCD_DAI']),
  LDO: contractDesc(erc20, '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'),
  MKR: contractDesc(erc20, mainnetAddresses['MCD_GOV']),
  STETH: contractDesc(erc20, mainnetAddresses['STETH']),
  USDP: contractDesc(erc20, '0x8E870D67F660D95d5be530380D0eC0bd388289E1'),
  WSTETH: contractDesc(erc20, mainnetAddresses['WSTETH']),
  RENBTC: contractDesc(erc20, mainnetAddresses['RENBTC']),
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
