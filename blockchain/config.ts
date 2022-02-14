import { ContractDesc } from '@oasisdex/web3-context'
import { keyBy } from 'lodash'
import getConfig from 'next/config'
import { Dictionary } from 'ts-essentials'

import { Abi } from '../helpers/types'
import * as eth from './abi/ds-eth-token.json'
import * as dsProxyFactory from './abi/ds-proxy-factory.json'
import * as dsProxyRegistry from './abi/ds-proxy-registry.json'
import * as dssCdpManager from './abi/dss-cdp-manager.json'
import * as guniProxyActions from './abi/dss-guni-proxy-actions.json'
import * as dssProxyActionsCharter from './abi/dss-proxy-actions-charter.json'
import * as dssProxyActionsDsr from './abi/dss-proxy-actions-dsr.json'
import * as dssProxyActions from './abi/dss-proxy-actions.json'
import * as erc20 from './abi/erc20.json'
import * as exchange from './abi/exchange.json'
import * as getCdps from './abi/get-cdps.json'
import * as guniToken from './abi/guni-token.json'
import * as otc from './abi/matching-market.json'
import * as mcdDog from './abi/mcd-dog.json'
import * as mcdEnd from './abi/mcd-end.json'
import * as mcdJoinDai from './abi/mcd-join-dai.json'
import * as mcdJug from './abi/mcd-jug.json'
import * as mcdPot from './abi/mcd-pot.json'
import * as mcdSpot from './abi/mcd-spot.json'
import * as dssMultiplyProxyActions from './abi/multiply-proxy-actions.json'
import * as otcSupport from './abi/otc-support-methods.json'
import * as vat from './abi/vat.json'
import {
  getCollateralJoinContracts,
  getCollaterals,
  getCollateralTokens,
  getOsms,
} from './addresses/addressesUtils'
import { default as goerliAddresses } from './addresses/goerli.json'
import { default as kovanAddresses } from './addresses/kovan.json'
import { default as mainnetAddresses } from './addresses/mainnet.json'

export function contractDesc(abi: Abi[], address: string): ContractDesc {
  return { abi, address }
}

const infuraProjectId =
  process.env.INFURA_PROJECT_ID || getConfig()?.publicRuntimeConfig?.infuraProjectId || ''
const etherscanAPIKey =
  process.env.ETHERSCAN_API_KEY || getConfig()?.publicRuntimeConfig?.etherscan || ''

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
]

const tokensMainnet = {
  ...getCollateralTokens(mainnetAddresses, supportedIlks),
  GUNIV3DAIUSDC1: contractDesc(guniToken, mainnetAddresses['GUNIV3DAIUSDC1']),
  GUNIV3DAIUSDC2: contractDesc(guniToken, mainnetAddresses['GUNIV3DAIUSDC2']),
  WETH: contractDesc(eth, mainnetAddresses['ETH']),
  DAI: contractDesc(erc20, mainnetAddresses['MCD_DAI']),
} as Dictionary<ContractDesc>
const protoMain = {
  id: '1',
  name: 'main',
  label: 'Mainnet',
  infuraUrl: `https://mainnet.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://mainnet.infura.io/ws/v3/${infuraProjectId}`,
  safeConfirmations: 10,
  otc: contractDesc(otc, '0x794e6e91555438aFc3ccF1c5076A74F42133d08D'),
  collaterals: getCollaterals(mainnetAddresses, supportedIlks),
  tokens: tokensMainnet,
  tokensMainnet,
  joins: {
    ...getCollateralJoinContracts(mainnetAddresses, supportedIlks),
  },
  getCdps: contractDesc(getCdps, mainnetAddresses.GET_CDPS),
  mcdOsms: getOsms(mainnetAddresses, supportedIlks),
  mcdJug: contractDesc(mcdJug, mainnetAddresses.MCD_JUG),
  mcdPot: contractDesc(mcdPot, mainnetAddresses.MCD_POT),
  mcdEnd: contractDesc(mcdEnd, mainnetAddresses.MCD_END),
  mcdSpot: contractDesc(mcdSpot, mainnetAddresses.MCD_SPOT),
  mcdDog: contractDesc(mcdDog, mainnetAddresses.MCD_DOG),
  dssCdpManager: contractDesc(dssCdpManager, mainnetAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x9b3f075b12513afe56ca2ed838613b7395f57839'),
  vat: contractDesc(vat, mainnetAddresses.MCD_VAT),
  mcdJoinDai: contractDesc(mcdJoinDai, mainnetAddresses.MCD_JOIN_DAI),
  dsProxyRegistry: contractDesc(dsProxyRegistry, mainnetAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, mainnetAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, mainnetAddresses.PROXY_ACTIONS),
  dssProxyActionsCharter: contractDesc(
    dssProxyActionsCharter,
    mainnetAddresses.PROXY_ACTIONS_CHARTER,
  ),
  guniProxyActions: contractDesc(guniProxyActions, '0xed3a954c0adfc8e3f85d92729c051ff320648e30'),
  guniResolver: '0x0317650Af6f184344D7368AC8bB0bEbA5EDB214a',
  guniRouter: '0x14E6D67F824C3a7b4329d3228807f8654294e4bd',
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    '0x2a49eae5cca3f050ebec729cf90cc910fadaf7a2',
  ),
  defaultExchange: contractDesc(exchange, '0xb5eB8cB6cED6b6f8E13bcD502fb489Db4a726C7B'),
  noFeesExchange: contractDesc(exchange, '0x99e4484dac819aa74b347208752306615213d324'),
  lowerFeesExchange: contractDesc(exchange, '0x12dcc776525c35836b10026929558208d1258b91'),
  fmm: mainnetAddresses.MCD_FLASH,
  etherscan: {
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  ethtx: {
    url: 'https://ethtx.info/mainnet',
  },
  taxProxyRegistries: ['0xaa63c8683647ef91b3fdab4b4989ee9588da297b'],
  dssProxyActionsDsr: contractDesc(
    dssProxyActionsDsr,
    '0x07ee93aEEa0a36FfF2A9B95dd22Bd6049EE54f26',
  ),
  magicLink: {
    apiKey: '',
  },
  cacheApi: 'https://oazo-bcache.new.oasis.app/api/v1',
}

export type NetworkConfig = typeof protoMain

const main: NetworkConfig = protoMain
const kovan: NetworkConfig = {
  id: '42',
  name: 'kovan',
  label: 'Kovan',
  infuraUrl: `https://kovan.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://kovan.infura.io/ws/v3/${infuraProjectId}`,
  safeConfirmations: 6,
  otc: contractDesc(otc, '0xe325acB9765b02b8b418199bf9650972299235F4'),
  collaterals: getCollaterals(kovanAddresses, supportedIlks),
  tokens: {
    ...getCollateralTokens(kovanAddresses, supportedIlks),
    WETH: contractDesc(eth, kovanAddresses['ETH']),
    DAI: contractDesc(erc20, kovanAddresses['MCD_DAI']),
    USDC: contractDesc(erc20, '0x198419c5c340e8De47ce4C0E4711A03664d42CB2'),
  },
  joins: {
    ...getCollateralJoinContracts(kovanAddresses, supportedIlks),
  },
  getCdps: contractDesc(getCdps, kovanAddresses.GET_CDPS),
  mcdOsms: getOsms(kovanAddresses, supportedIlks),
  mcdPot: contractDesc(mcdPot, kovanAddresses.MCD_POT),
  mcdJug: contractDesc(mcdJug, kovanAddresses.MCD_JUG),
  mcdEnd: contractDesc(mcdEnd, kovanAddresses.MCD_END),
  mcdSpot: contractDesc(mcdSpot, kovanAddresses.MCD_SPOT),
  mcdDog: contractDesc(mcdDog, kovanAddresses.MCD_DOG),
  dssCdpManager: contractDesc(dssCdpManager, kovanAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x303f2bf24d98325479932881657f45567b3e47a8'),
  vat: contractDesc(vat, kovanAddresses.MCD_VAT),
  mcdJoinDai: contractDesc(mcdJoinDai, kovanAddresses.MCD_JOIN_DAI),
  dsProxyRegistry: contractDesc(dsProxyRegistry, kovanAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, kovanAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, kovanAddresses.PROXY_ACTIONS),
  dssProxyActionsCharter: contractDesc(
    dssProxyActionsCharter,
    kovanAddresses.PROXY_ACTIONS_CHARTER,
  ),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    getConfig()?.publicRuntimeConfig?.multiplyProxyActions || '',
  ),
  guniProxyActions: contractDesc(guniProxyActions, '0x'), // TODO: add address
  guniResolver: '0x',
  guniRouter: '0x',
  defaultExchange: contractDesc(exchange, getConfig()?.publicRuntimeConfig?.exchangeAddress || ''), // TODO: UPDATE ADDRESS AFTER DEPLOYMENT
  lowerFeesExchange: contractDesc(exchange, '0x0'),
  noFeesExchange: contractDesc(exchange, '0x0'),
  fmm: '0x',
  etherscan: {
    url: 'https://kovan.etherscan.io',
    apiUrl: 'https://api-kovan.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  ethtx: {
    url: 'https://ethtx.info/kovan',
  },
  taxProxyRegistries: [kovanAddresses.PROXY_REGISTRY],
  tokensMainnet: protoMain.tokensMainnet,
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, kovanAddresses.PROXY_ACTIONS_DSR),
  magicLink: {
    apiKey: '',
  },
  cacheApi: 'https://oazo-bcache-kovan-staging.new.oasis.app/api/v1',
}

const goerli: NetworkConfig = {
  id: '5',
  name: 'goerli',
  label: 'goerli',
  infuraUrl: `https://goerli.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://goerli.infura.io/ws/v3/${infuraProjectId}`,
  safeConfirmations: 6,
  otc: contractDesc(otc, '0x0000000000000000000000000000000000000000'),
  collaterals: getCollaterals(goerliAddresses, supportedIlks),
  tokens: {
    ...getCollateralTokens(goerliAddresses, supportedIlks),
    WETH: contractDesc(eth, goerliAddresses.ETH),
    DAI: contractDesc(erc20, goerliAddresses.MCD_DAI),
  },
  tokensMainnet: protoMain.tokensMainnet,
  joins: {
    ...getCollateralJoinContracts(goerliAddresses, supportedIlks),
  },
  getCdps: contractDesc(getCdps, goerliAddresses.GET_CDPS),
  mcdOsms: getOsms(goerliAddresses, supportedIlks),
  mcdPot: contractDesc(mcdPot, goerliAddresses.MCD_POT),
  mcdJug: contractDesc(mcdJug, goerliAddresses.MCD_JUG),
  mcdEnd: contractDesc(mcdEnd, goerliAddresses.MCD_END),
  mcdSpot: contractDesc(mcdSpot, goerliAddresses.MCD_SPOT),
  mcdDog: contractDesc(mcdDog, goerliAddresses.MCD_DOG),
  dssCdpManager: contractDesc(dssCdpManager, goerliAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x0000000000000000000000000000000000000000'),
  vat: contractDesc(vat, goerliAddresses.MCD_VAT),
  mcdJoinDai: contractDesc(mcdJoinDai, goerliAddresses.MCD_JOIN_DAI),
  dsProxyRegistry: contractDesc(dsProxyRegistry, goerliAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, goerliAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, goerliAddresses.PROXY_ACTIONS),
  dssProxyActionsCharter: contractDesc(
    dssProxyActionsCharter,
    goerliAddresses.PROXY_ACTIONS_CHARTER,
  ),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    '0x24E54706B100e2061Ed67fAe6894791ec421B421',
  ),
  guniProxyActions: contractDesc(guniProxyActions, '0x'), // TODO: add address
  guniResolver: '0x',
  guniRouter: '0x',
  // Currently this is not supported on Goerli - no deployed contract
  defaultExchange: contractDesc(exchange, '0x84564e7D57Ee18D646b32b645AFACE140B19083d'),
  lowerFeesExchange: contractDesc(exchange, '0x84564e7D57Ee18D646b32b645AFACE140B19083d'),
  noFeesExchange: contractDesc(exchange, '0x84564e7D57Ee18D646b32b645AFACE140B19083d'),
  // Currently this is not supported on Goerli - no deployed contract
  fmm: goerliAddresses.MCD_FLASH,
  etherscan: {
    url: 'https://goerli.etherscan.io',
    apiUrl: 'https://api-goerli.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  ethtx: {
    url: 'https://ethtx.info/goerli',
  },
  taxProxyRegistries: [goerliAddresses.PROXY_REGISTRY],
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, goerliAddresses.PROXY_ACTIONS_DSR),
  magicLink: {
    apiKey: '',
  },
  cacheApi: 'https://oazo-bcache-goerli-staging.new.oasis.app/api/v1',
}

const hardhat: NetworkConfig = {
  ...protoMain,
  id: '2137',
  name: 'hardhat',
  label: 'Hardhat',
  infuraUrl: `http://localhost:8545`,
  infuraUrlWS: `ws://localhost:8545`,
  cacheApi: 'http://localhost:3001/v1',
  /* dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    getConfig()?.publicRuntimeConfig?.multiplyProxyActions ||
      '0x2a49eae5cca3f050ebec729cf90cc910fadaf7a2',
  ),
  // guniProxyActions: contractDesc(guniProxyActions, '0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25'),
  defaultExchange: contractDesc(
    exchange,
    getConfig()?.publicRuntimeConfig?.exchangeAddress ||
      '0x4C4a2f8c81640e47606d3fd77B353E87Ba015584',
  ), */
}

export const networksById = keyBy([main, kovan, hardhat, goerli], 'id')
export const networksByName = keyBy([main, kovan, hardhat, goerli], 'name')

export const dappName = 'Oasis'
export const pollingInterval = 12000
