import { ContractDesc } from '@oasisdex/web3-context'
import { Abi } from 'helpers/types'
import { keyBy } from 'lodash'
import getConfig from 'next/config'
import { Dictionary } from 'ts-essentials'

import * as automationBot from './abi/automation-bot.json'
import * as cdpRegistry from './abi/cdp-registry.json'
import * as eth from './abi/ds-eth-token.json'
import * as dsProxyFactory from './abi/ds-proxy-factory.json'
import * as dsProxyRegistry from './abi/ds-proxy-registry.json'
import * as dssCdpManager from './abi/dss-cdp-manager.json'
import * as dssCharter from './abi/dss-charter.json'
import * as dssCropper from './abi/dss-cropper.json'
import * as guniProxyActions from './abi/dss-guni-proxy-actions.json'
import * as dssProxyActionsCharter from './abi/dss-proxy-actions-charter.json'
import * as dssProxyActionsCropjoin from './abi/dss-proxy-actions-cropjoin.json'
import * as dssProxyActionsDsr from './abi/dss-proxy-actions-dsr.json'
import * as dssProxyActions from './abi/dss-proxy-actions.json'
import * as dummyAutomationBotAggregator from './abi/dummy-automation-bot-aggregator.json'
import * as erc20 from './abi/erc20.json'
import * as exchange from './abi/exchange.json'
import * as getCdps from './abi/get-cdps.json'
import * as guniToken from './abi/guni-token.json'
import * as lidoCrvLiquidityFarmingReward from './abi/lido-crv-liquidity-farming-reward.json'
import * as otc from './abi/matching-market.json'
import * as mcdDog from './abi/mcd-dog.json'
import * as mcdEnd from './abi/mcd-end.json'
import * as mcdJoinDai from './abi/mcd-join-dai.json'
import * as mcdJug from './abi/mcd-jug.json'
import * as mcdPot from './abi/mcd-pot.json'
import * as mcdSpot from './abi/mcd-spot.json'
import * as merkleRedeemer from './abi/merkle-redeemer.json'
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
const mainnetCacheUrl =
  process.env.MAINNET_CACHE_URL ||
  getConfig()?.publicRuntimeConfig?.mainnetCacheURL ||
  'https://oazo-bcache.new.oasis.app/api/v1'

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
  ...charterIlks,
  ...cropJoinIlks,
] as const

export const ilksNotSupportedOnGoerli = [
  'GUNIV3DAIUSDC1-A',
  'GUNIV3DAIUSDC2-A',
  ...charterIlks,
  ...cropJoinIlks,
] as const

const tokensMainnet = {
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
const protoMain = {
  id: '1',
  name: 'main',
  label: 'Mainnet',
  infuraUrl: `https://mainnet.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://mainnet.infura.io/ws/v3/${infuraProjectId}`,
  safeConfirmations: 10,
  openVaultSafeConfirmations: 6,
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
  merkleRedeemer: contractDesc(merkleRedeemer, '0xd9fabf81Ed15ea71FBAd0C1f77529a4755a38054'),
  dssCharter: contractDesc(dssCharter, '0x0000123'),
  dssCdpManager: contractDesc(dssCdpManager, mainnetAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x9b3f075b12513afe56ca2ed838613b7395f57839'),
  vat: contractDesc(vat, mainnetAddresses.MCD_VAT),
  mcdJoinDai: contractDesc(mcdJoinDai, mainnetAddresses.MCD_JOIN_DAI),
  dsProxyRegistry: contractDesc(dsProxyRegistry, mainnetAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, mainnetAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, mainnetAddresses.PROXY_ACTIONS),
  dssProxyActionsCharter: contractDesc(dssProxyActionsCharter, '0x0000'),
  automationBot: contractDesc(automationBot, '0x6E87a7A0A03E51A741075fDf4D1FCce39a4Df01b'),
  automationBotAggregator: contractDesc(dummyAutomationBotAggregator, '0x'), //TODO address ŁW
  serviceRegistry: '0x9b4Ae7b164d195df9C4Da5d08Be88b2848b2EaDA',
  guniProxyActions: contractDesc(guniProxyActions, '0xed3a954c0adfc8e3f85d92729c051ff320648e30'),
  guniResolver: '0x0317650Af6f184344D7368AC8bB0bEbA5EDB214a',
  guniRouter: '0x14E6D67F824C3a7b4329d3228807f8654294e4bd',
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    '0x2a49eae5cca3f050ebec729cf90cc910fadaf7a2',
  ),
  dssCropper: contractDesc(dssCropper, '0x8377CD01a5834a6EaD3b7efb482f678f2092b77e'),
  cdpRegistry: contractDesc(cdpRegistry, '0xBe0274664Ca7A68d6b5dF826FB3CcB7c620bADF3'),
  dssProxyActionsCropjoin: contractDesc(
    dssProxyActionsCropjoin,
    '0xa2f69F8B9B341CFE9BfBb3aaB5fe116C89C95bAF',
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
  cacheApi: mainnetCacheUrl,
  lidoCrvLiquidityFarmingReward: contractDesc(
    lidoCrvLiquidityFarmingReward,
    // address from here: https://docs.lido.fi/deployed-contracts
    '0x99ac10631f69c753ddb595d074422a0922d9056b',
  ),
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
  openVaultSafeConfirmations: 6,
  otc: contractDesc(otc, '0xe325acB9765b02b8b418199bf9650972299235F4'),
  collaterals: getCollaterals(kovanAddresses, supportedIlks),
  tokens: {
    ...getCollateralTokens(kovanAddresses, supportedIlks),
    WETH: contractDesc(eth, kovanAddresses['ETH']),
    DAI: contractDesc(erc20, kovanAddresses['MCD_DAI']),
    USDC: contractDesc(erc20, '0x198419c5c340e8De47ce4C0E4711A03664d42CB2'),
    MKR: contractDesc(erc20, kovanAddresses['MCD_GOV']),
    stETH: contractDesc(erc20, '0x00'),
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
  merkleRedeemer: contractDesc(merkleRedeemer, '0x0'),
  dssCharter: contractDesc(dssCharter, '0x0000'),
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
  cdpRegistry: contractDesc(cdpRegistry, '0x'),
  dssProxyActionsCropjoin: contractDesc(dssProxyActionsCropjoin, '0x'),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    getConfig()?.publicRuntimeConfig?.multiplyProxyActions || '',
  ),
  guniProxyActions: contractDesc(guniProxyActions, '0x'), // TODO: add address
  automationBot: contractDesc(automationBot, '0x'), // TODO: add address
  automationBotAggregator: contractDesc(dummyAutomationBotAggregator, '0x'), //TODO address ŁW
  serviceRegistry: '0x', // TODO: add address
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
  dssCropper: contractDesc(dssCropper, '0x00000'), // DOES NOT EXISTS
  taxProxyRegistries: [kovanAddresses.PROXY_REGISTRY],
  tokensMainnet: protoMain.tokensMainnet,
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, kovanAddresses.PROXY_ACTIONS_DSR),
  magicLink: {
    apiKey: '',
  },
  cacheApi: 'https://oazo-bcache-kovan-staging.new.oasis.app/api/v1',
  lidoCrvLiquidityFarmingReward: contractDesc(lidoCrvLiquidityFarmingReward, '0x00'),
}

const goerli: NetworkConfig = {
  id: '5',
  name: 'goerli',
  label: 'goerli',
  infuraUrl: `https://goerli.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://goerli.infura.io/ws/v3/${infuraProjectId}`,
  safeConfirmations: 6,
  openVaultSafeConfirmations: 6,
  otc: contractDesc(otc, '0x0000000000000000000000000000000000000000'),
  collaterals: getCollaterals(goerliAddresses, supportedIlks),
  tokens: {
    ...getCollateralTokens(goerliAddresses, supportedIlks),
    WETH: contractDesc(eth, goerliAddresses.ETH),
    DAI: contractDesc(erc20, goerliAddresses.MCD_DAI),
    MKR: contractDesc(erc20, goerliAddresses['MCD_GOV']),
    STETH: contractDesc(erc20, goerliAddresses['STETH']),
    USDP: contractDesc(erc20, '0xd1a7a9d23f298192f8abf31243dd4f332d681d61'),
  },
  tokensMainnet: protoMain.tokensMainnet,
  joins: {
    ...getCollateralJoinContracts(goerliAddresses, supportedIlks),
    // Todo: move to goerli network config when available at changelog.makerdao.com
    'INST-ETH-A': '0x99507A436aC9E8eB5A89001a2dFc80E343D82122',
    'INST-WBTC-A': '0xbd5978308C9BbF6d8d1D26cD1df9AA3EA83F782a',
  },
  getCdps: contractDesc(getCdps, goerliAddresses.GET_CDPS),
  mcdOsms: getOsms(goerliAddresses, supportedIlks),
  mcdPot: contractDesc(mcdPot, goerliAddresses.MCD_POT),
  mcdJug: contractDesc(mcdJug, goerliAddresses.MCD_JUG),
  mcdEnd: contractDesc(mcdEnd, goerliAddresses.MCD_END),
  mcdSpot: contractDesc(mcdSpot, goerliAddresses.MCD_SPOT),
  mcdDog: contractDesc(mcdDog, goerliAddresses.MCD_DOG),
  merkleRedeemer: contractDesc(merkleRedeemer, '0x23440aC6c8a10EA89132da74B705CBc6D99a805b'),
  dssCharter: contractDesc(dssCharter, '0x7ea0d7ea31C544a472b55D19112e016Ba6708288'),
  dssCdpManager: contractDesc(dssCdpManager, goerliAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x0000000000000000000000000000000000000000'),
  vat: contractDesc(vat, goerliAddresses.MCD_VAT),
  mcdJoinDai: contractDesc(mcdJoinDai, goerliAddresses.MCD_JOIN_DAI),
  dsProxyRegistry: contractDesc(dsProxyRegistry, goerliAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, goerliAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, goerliAddresses.PROXY_ACTIONS),
  dssProxyActionsCharter: contractDesc(
    dssProxyActionsCharter,
    '0xfFb896D7BEf704DF73abc9A2EBf295CE236c5919',
  ),
  cdpRegistry: contractDesc(cdpRegistry, '0x0636E6878703E30aB11Ba13A68C6124d9d252e6B'),
  dssProxyActionsCropjoin: contractDesc(dssProxyActionsCropjoin, '0x'),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    '0xc9628adc0a9f95D1d912C5C19aaBFF85E420a853',
  ),
  guniProxyActions: contractDesc(guniProxyActions, '0x'), // TODO: add address
  dssCropper: contractDesc(dssCropper, '0x00000'), // DOES NOT EXISTS
  guniResolver: '0x',
  guniRouter: '0x',
  automationBot: contractDesc(automationBot, '0xabDB63B4b3BA9f960CF942800a6982F88e9b1A6b'),
  automationBotAggregator: contractDesc(
    dummyAutomationBotAggregator,
    '0x59C47BA3a71DC5d049Ea88b65F1Af2504D93b885',
  ),
  serviceRegistry: '0x5A5277B8c8a42e6d8Ab517483D7D59b4ca03dB7F',
  defaultExchange: contractDesc(exchange, '0x2b0b4c5c58fe3CF8863c4948887099A09b84A69c'),
  lowerFeesExchange: contractDesc(exchange, '0x2b0b4c5c58fe3CF8863c4948887099A09b84A69c'),
  noFeesExchange: contractDesc(exchange, '0x2b0b4c5c58fe3CF8863c4948887099A09b84A69c'),
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
  lidoCrvLiquidityFarmingReward: contractDesc(lidoCrvLiquidityFarmingReward, '0x00'),
}

const hardhat: NetworkConfig = {
  ...protoMain,
  id: '2137',
  name: 'hardhat',
  label: 'Hardhat',
  infuraUrl: `http://localhost:8545`,
  infuraUrlWS: `ws://localhost:8545`,
  cacheApi: 'https://oazo-bcache-mainnet-staging.new.oasis.app/api/v1',
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
