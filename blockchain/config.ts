import { ContractDesc } from '@oasisdex/web3-context'
import { keyBy } from 'lodash'
import getConfig from 'next/config'
import { Dictionary } from 'ts-essentials'

import * as eth from './abi/ds-eth-token.json'
import * as dsProxyFactory from './abi/ds-proxy-factory.json'
import * as dsProxyRegistry from './abi/ds-proxy-registry.json'
import * as dssCdpManager from './abi/dss-cdp-manager.json'
import * as dssProxyActionsDsr from './abi/dss-proxy-actions-dsr.json'
import * as dssProxyActions from './abi/dss-proxy-actions.json'
import * as erc20 from './abi/erc20.json'
import * as exchange from './abi/exchange.json'
import * as getCdps from './abi/get-cdps.json'
import * as otc from './abi/matching-market.json'
import * as mcdCat from './abi/mcd-cat.json'
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
import { default as kovanAddresses } from './addresses/kovan.json'
import { default as mainnetAddresses } from './addresses/mainnet.json'

export function contractDesc(abi: any, address: string): ContractDesc {
  return { abi, address }
}

const infuraProjectId =
  process.env.INFURA_PROJECT_ID || getConfig()?.publicRuntimeConfig?.infuraProjectId || ''
const etherscanAPIKey =
  process.env.ETHERSCAN_API_KEY || getConfig()?.publicRuntimeConfig?.etherscan || ''

  console.log('Exchange Address:',getConfig()?.publicRuntimeConfig?.exchangeAddress)

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
    WETH: contractDesc(eth, mainnetAddresses['ETH']),
    DAI: contractDesc(erc20, mainnetAddresses['MCD_DAI']),
    MKR: contractDesc(erc20, mainnetAddresses.MCD_GOV),
    CHAI: contractDesc(erc20, '0x06af07097c9eeb7fd685c692751d5c66db49c215'),
    // WBTC: contractDesc(erc20, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
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
  mcdCat: contractDesc(mcdCat, mainnetAddresses.MCD_CAT),
  dssCdpManager: contractDesc(dssCdpManager, mainnetAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x9b3f075b12513afe56ca2ed838613b7395f57839'),
  vat: contractDesc(vat, mainnetAddresses.MCD_VAT),
  mcdJoinDai: contractDesc(mcdJoinDai, mainnetAddresses.MCD_JOIN_DAI),
  dsProxyRegistry: contractDesc(dsProxyRegistry, mainnetAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, mainnetAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, mainnetAddresses.PROXY_ACTIONS),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    getConfig()?.publicRuntimeConfig?.multiplyProxyActions || '',
  ),
  exchange: contractDesc(exchange, getConfig()?.publicRuntimeConfig?.exchangeAddress || ''),
  aaveLendingPool: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
  etherscan: {
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: '34JVYM6RPM3J1SK8QXQFRNSHD9XG4UHXVU',
  },
  taxProxyRegistries: ['0xaa63c8683647ef91b3fdab4b4989ee9588da297b'],
  dssProxyActionsDsr: contractDesc(
    dssProxyActionsDsr,
    '0x07ee93aEEa0a36FfF2A9B95dd22Bd6049EE54f26',
  ),
  magicLink: {
    apiKey: 'pk_live_3256343D62443CE6',
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
    MKR: contractDesc(erc20, kovanAddresses.MCD_GOV),
    CHAI: contractDesc(erc20, '0xb641957b6c29310926110848db2d464c8c3c3f38'),
    // WBTC: contractDesc(erc20, '0xA08d982C2deBa0DbE433a9C6177a219E96CeE656'),
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
  mcdCat: contractDesc(mcdCat, kovanAddresses.MCD_CAT),
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
  exchange: contractDesc(exchange, getConfig()?.publicRuntimeConfig?.exchangeAddress || ''), // TODO: UPDATE ADDRESS AFTER DEPLOYMENT
  aaveLendingPool: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
  etherscan: {
    url: 'https://kovan.etherscan.io',
    apiUrl: 'https://api-kovan.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  taxProxyRegistries: [kovanAddresses.PROXY_REGISTRY],
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, kovanAddresses.PROXY_ACTIONS_DSR),
  magicLink: {
    apiKey: 'pk_test_E72F1844D7C09A07',
  },
  cacheApi: 'https://oazo-bcache-kovan-staging.new.oasis.app/api/v1 ',
}

const hardhat: NetworkConfig = {
  ...protoMain,
  id: '2137',
  name: 'hardhat',
  label: 'Hardhat',
  infuraUrl: `http://localhost:8545`,
  infuraUrlWS: `ws://localhost:8545`,
  cacheApi: 'http://localhost:3001/v1',
}

export const networksById = keyBy([main, kovan, hardhat], 'id')
export const networksByName = keyBy([main, kovan, hardhat], 'name')

export const dappName = 'Oasis'
export const pollingInterval = 12000
