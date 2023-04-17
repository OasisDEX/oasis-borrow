import * as aaveV2LendingPool from 'blockchain/abi/aave-v2-lending-pool.json'
import * as aaveV2PriceOracle from 'blockchain/abi/aave-v2-price-oracle.json'
import * as aaveV2ProtocolDataProvider from 'blockchain/abi/aave-v2-protocol-data-provider.json'
import * as aaveV3Oracle from 'blockchain/abi/aave-v3-oracle.json'
import * as aaveV3PoolDataProvider from 'blockchain/abi/aave-v3-pool-data-provider.json'
import * as aaveV3Pool from 'blockchain/abi/aave-v3-pool.json'
import * as accountFactory from 'blockchain/abi/account-factory.json'
import * as accountGuard from 'blockchain/abi/account-guard.json'
import * as ajnaPoolInfo from 'blockchain/abi/ajna-pool-info.json'
import * as ajnaPool from 'blockchain/abi/ajna-pool.json'
import * as ajnaProxyActions from 'blockchain/abi/ajna-proxy-actions.json'
import * as ajnaRewardsClaimer from 'blockchain/abi/ajna-rewards-claimer.json'
import * as ajnaRewardsManager from 'blockchain/abi/ajna-rewards-manager.json'
import * as automationBotAggregator from 'blockchain/abi/automation-bot-aggregator.json'
import * as automationBotV2 from 'blockchain/abi/automation-bot-v2.json'
import * as automationBot from 'blockchain/abi/automation-bot.json'
import * as cdpRegistry from 'blockchain/abi/cdp-registry.json'
import * as chainLinkPriceOracle from 'blockchain/abi/chainlink-price-oracle.json'
import * as eth from 'blockchain/abi/ds-eth-token.json'
import * as dsProxyFactory from 'blockchain/abi/ds-proxy-factory.json'
import * as dsProxyRegistry from 'blockchain/abi/ds-proxy-registry.json'
import * as dssCdpManager from 'blockchain/abi/dss-cdp-manager.json'
import * as dssCharter from 'blockchain/abi/dss-charter.json'
import * as dssCropper from 'blockchain/abi/dss-cropper.json'
import * as guniProxyActions from 'blockchain/abi/dss-guni-proxy-actions.json'
import * as dssProxyActionsCharter from 'blockchain/abi/dss-proxy-actions-charter.json'
import * as dssProxyActionsCropjoin from 'blockchain/abi/dss-proxy-actions-cropjoin.json'
import * as dssProxyActionsDsr from 'blockchain/abi/dss-proxy-actions-dsr.json'
import * as dssProxyActions from 'blockchain/abi/dss-proxy-actions.json'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as exchange from 'blockchain/abi/exchange.json'
import * as getCdps from 'blockchain/abi/get-cdps.json'
import * as lidoCrvLiquidityFarmingReward from 'blockchain/abi/lido-crv-liquidity-farming-reward.json'
import * as otc from 'blockchain/abi/matching-market.json'
import * as mcdDog from 'blockchain/abi/mcd-dog.json'
import * as mcdEnd from 'blockchain/abi/mcd-end.json'
import * as mcdJoinDai from 'blockchain/abi/mcd-join-dai.json'
import * as mcdJug from 'blockchain/abi/mcd-jug.json'
import * as mcdPot from 'blockchain/abi/mcd-pot.json'
import * as mcdSpot from 'blockchain/abi/mcd-spot.json'
import * as merkleRedeemer from 'blockchain/abi/merkle-redeemer.json'
import * as dssMultiplyProxyActions from 'blockchain/abi/multiply-proxy-actions.json'
import * as operationExecutor from 'blockchain/abi/operation-executor.json'
import * as otcSupport from 'blockchain/abi/otc-support-methods.json'
import * as vat from 'blockchain/abi/vat.json'
import {
  getCollateralJoinContracts,
  getCollaterals,
  getCollateralTokens,
  getOsms,
} from 'blockchain/addresses/addressesUtils'
import { default as goerliAddresses } from 'blockchain/addresses/goerli.json'
import { contractDesc } from 'blockchain/networksConfig'
import {
  AAVE_V2_LENDING_POOL_GENESIS_GOERLI,
  AAVE_V3_POOL_GENESIS_GOERLI,
  ACCOUNT_GUARD_FACTORY_GENESIS_GOERLI,
} from 'blockchain/tokens/goerli'
import { supportedIlks } from 'blockchain/tokens/mainnet'
import { etherscanAPIKey } from 'config/runtimeConfig'

import { MainnetContracts, mainnetContracts } from './mainnet'

export const goerliContracts: MainnetContracts = {
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
  tokensMainnet: mainnetContracts.tokensMainnet,
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
  automationBotV2: contractDesc(automationBotV2, '0x0'),
  automationBotAggregator: contractDesc(
    automationBotAggregator,
    '0xeb3c922A805FAEEac8f311E1AdF34fBC518099ab',
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
  aaveTokens: {},
  aaveV2ProtocolDataProvider: contractDesc(
    aaveV2ProtocolDataProvider,
    // address from here:https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    goerliAddresses.AAVE_V2_PROTOCOL_DATA_PROVIDER,
  ),
  aaveV2PriceOracle: contractDesc(
    aaveV2PriceOracle,
    // address from here:https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    goerliAddresses.AAVE_V2_PRICE_ORACLE,
  ),
  chainlinkPriceOracle: {
    USDCUSD: contractDesc(
      chainLinkPriceOracle,
      // address from here:https://docs.chain.link/data-feeds/price-feeds/addresses
      goerliAddresses.CHAINLINK_USDC_USD_PRICE_FEED,
    ),
    ETHUSD: contractDesc(chainLinkPriceOracle, goerliAddresses.CHAINLINK_ETH_USD_PRICE_FEED),
  },
  aaveV2LendingPool: contractDesc(
    aaveV2LendingPool,
    goerliAddresses.AAVE_V2_LENDING_POOL,
    AAVE_V2_LENDING_POOL_GENESIS_GOERLI,
  ),
  operationExecutor: contractDesc(operationExecutor, goerliAddresses.OPERATION_EXECUTOR),
  swapAddress: goerliAddresses.SWAP,
  accountFactory: contractDesc(
    accountFactory,
    goerliAddresses.ACCOUNT_FACTORY,
    ACCOUNT_GUARD_FACTORY_GENESIS_GOERLI,
  ),
  accountGuard: contractDesc(
    accountGuard,
    goerliAddresses.ACCOUNT_GUARD,
    ACCOUNT_GUARD_FACTORY_GENESIS_GOERLI,
  ),
  aaveV3Pool: contractDesc(aaveV3Pool, goerliAddresses.AAVE_V3_POOL, AAVE_V3_POOL_GENESIS_GOERLI),
  aaveV3Oracle: contractDesc(aaveV3Oracle, goerliAddresses.AAVE_V3_ORACLE),
  aaveV3PoolDataProvider: contractDesc(
    aaveV3PoolDataProvider,
    goerliAddresses.AAVE_V3_POOL_DATA_PROVIDER,
  ),
  ajnaPoolInfo: contractDesc(ajnaPoolInfo, '0xEa36b2a4703182d07df9DdEe46BF97f9979F0cCf'),
  ajnaProxyActions: contractDesc(ajnaProxyActions, '0xE27E4fAdE5d3A2Bf6D76D0a20d437314d9da6139'),
  ajnaPoolPairs: {
    'WBTC-USDC': contractDesc(ajnaPool, '0x17e5a1A6450d4fB32fFFc329ca92db55293db10e'),
    'ETH-USDC': contractDesc(ajnaPool, '0xe1200AEfd60559D494d4419E17419571eF8fC1Eb'),
  },
  ajnaRewardsManager: contractDesc(
    ajnaRewardsManager,
    '0xEd6890d748e62ddbb3f80e7256Deeb2fBb853476',
  ),
  // TODO update address
  ajnaRewardsClaimer: contractDesc(
    ajnaRewardsClaimer,
    '0xEd6890d748e62ddbb3f80e7256Deeb2fBb853476',
  ),
}
