import { ContractDesc } from '@oasisdex/web3-context'
import { keyBy } from 'lodash'
import getConfig from 'next/config'
import { Dictionary } from 'ts-essentials'

import * as eth from './abi/ds-eth-token.json'
import * as dsProxyFactory from './abi/ds-proxy-factory.json'
import * as dsProxyRegistry from './abi/ds-proxy-registry.json'
import * as dssCdpManager from './abi/dss-cdp-manager.json'
import * as guniProxyActions from './abi/dss-guni-proxy-actions.json'
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

export function contractDesc(abi: any, address: string): ContractDesc {
  return { abi, address }
}

const infuraProjectId =
  process.env.INFURA_PROJECT_ID || getConfig()?.publicRuntimeConfig?.infuraProjectId || ''
const etherscanAPIKey =
  process.env.ETHERSCAN_API_KEY || getConfig()?.publicRuntimeConfig?.etherscan || ''

const protoMain = {
  id: '1',
  name: 'main',
  label: 'Mainnet',
  infuraUrl: `https://mainnet.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://mainnet.infura.io/ws/v3/${infuraProjectId}`,
  safeConfirmations: 10,
  otc: contractDesc(otc, '0x794e6e91555438aFc3ccF1c5076A74F42133d08D'),
  collaterals: getCollaterals(mainnetAddresses),
  tokens: {
    ...getCollateralTokens(mainnetAddresses),
    GUNIV3DAIUSDC1: contractDesc(guniToken, mainnetAddresses['GUNIV3DAIUSDC1']),
    WETH: contractDesc(eth, mainnetAddresses['ETH']),
    DAI: contractDesc(erc20, mainnetAddresses['MCD_DAI']),
  } as Dictionary<ContractDesc>,
  joins: {
    ...getCollateralJoinContracts(mainnetAddresses),
  },
  getCdps: contractDesc(getCdps, mainnetAddresses.GET_CDPS),
  mcdOsms: getOsms(mainnetAddresses),
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
  guniProxyActions: contractDesc(guniProxyActions, '0x64b0010f6b90d0ae0bf2587ba47f2d3437487447'),
  guniResolver: '0x0317650Af6f184344D7368AC8bB0bEbA5EDB214a',
  guniRouter: '0x14E6D67F824C3a7b4329d3228807f8654294e4bd',
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    '0x2a49eae5cca3f050ebec729cf90cc910fadaf7a2',
  ),
  exchange: contractDesc(exchange, '0xb5eB8cB6cED6b6f8E13bcD502fb489Db4a726C7B'),
  fmm: '0x1EB4CF3A948E7D72A198fe073cCb8C7a948cD853',
  etherscan: {
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
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
  collaterals: getCollaterals(kovanAddresses),
  tokens: {
    ...getCollateralTokens(kovanAddresses),
    WETH: contractDesc(eth, kovanAddresses['ETH']),
    DAI: contractDesc(erc20, kovanAddresses['MCD_DAI']),
    USDC: contractDesc(erc20, '0x198419c5c340e8De47ce4C0E4711A03664d42CB2'),
  },
  joins: {
    ...getCollateralJoinContracts(kovanAddresses),
  },
  getCdps: contractDesc(getCdps, kovanAddresses.GET_CDPS),
  mcdOsms: getOsms(kovanAddresses),
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
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    getConfig()?.publicRuntimeConfig?.multiplyProxyActions || '',
  ),
  guniProxyActions: contractDesc(guniProxyActions, '0x'), // TODO: add address
  guniResolver: '0x',
  guniRouter: '0x',
  exchange: contractDesc(exchange, getConfig()?.publicRuntimeConfig?.exchangeAddress || ''), // TODO: UPDATE ADDRESS AFTER DEPLOYMENT
  fmm: '0x1EB4CF3A948E7D72A198fe073cCb8C7a948cD853',
  etherscan: {
    url: 'https://kovan.etherscan.io',
    apiUrl: 'https://api-kovan.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  taxProxyRegistries: [kovanAddresses.PROXY_REGISTRY],
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
  collaterals: getCollaterals(goerliAddresses),
  tokens: {
    ...getCollateralTokens(goerliAddresses),
    WETH: contractDesc(eth, goerliAddresses.ETH),
    DAI: contractDesc(erc20, goerliAddresses.MCD_DAI),
  },
  joins: {
    ...getCollateralJoinContracts(goerliAddresses),
  },
  getCdps: contractDesc(getCdps, goerliAddresses.GET_CDPS),
  mcdOsms: getOsms(goerliAddresses),
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
  // Currently this is not supported on Goerli - no deployed contract
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    getConfig()?.publicRuntimeConfig?.multiplyProxyActions || '',
  ),
  guniProxyActions: contractDesc(guniProxyActions, '0x'), // TODO: add address
  guniResolver: '0x',
  guniRouter: '0x',
  // Currently this is not supported on Goerli - no deployed contract
  exchange: contractDesc(exchange, getConfig()?.publicRuntimeConfig?.exchangeAddress || ''),
  // Currently this is not supported on Goerli - no deployed contract
  fmm: '0x1EB4CF3A948E7D72A198fe073cCb8C7a948cD853',
  etherscan: {
    url: 'https://goerli.etherscan.io',
    apiUrl: 'https://api-goerli.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
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
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    getConfig()?.publicRuntimeConfig?.multiplyProxyActions ||
      '0x2a49eae5cca3f050ebec729cf90cc910fadaf7a2',
  ),
  // guniProxyActions: contractDesc(guniProxyActions, '0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25'),
  exchange: contractDesc(
    exchange,
    getConfig()?.publicRuntimeConfig?.exchangeAddress ||
      '0x4C4a2f8c81640e47606d3fd77B353E87Ba015584',
  ),
}

export const networksById = keyBy([main, kovan, hardhat, goerli], 'id')
export const networksByName = keyBy([main, kovan, hardhat, goerli], 'name')

export const dappName = 'Oasis'
export const pollingInterval = 12000
