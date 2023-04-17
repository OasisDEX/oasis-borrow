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
  getOsms,
} from 'blockchain/addresses/addressesUtils'
import { default as mainnetAddresses } from 'blockchain/addresses/mainnet.json'
import { contractDesc } from 'blockchain/networksConfig'
import {
  AAVE_V2_LENDING_POOL_GENESIS_MAINNET,
  AAVE_V3_POOL_GENESIS_MAINNET,
  ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
  supportedIlks,
  tokensMainnet,
} from 'blockchain/tokens/mainnet'
import { etherscanAPIKey, mainnetCacheUrl } from 'config/runtimeConfig'

export const mainnetContracts = {
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
  automationBotV2: contractDesc(automationBotV2, '0x8061c24823094E51e57A4a5cF8bEd3CCf09d316F'),
  automationBotAggregator: contractDesc(
    automationBotAggregator,
    '0x5f1d184204775fBB351C4b2C61a2fD4aAbd3fB76',
  ),
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
  lowerFeesExchange: contractDesc(exchange, '0xf22f17b1d2354b4f4f52e4d164e4eb5e1f0a6ba6'),
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
  aaveTokens: {
    STETH: mainnetAddresses['STETH'],
  } as Record<string, string>,
  aaveV2ProtocolDataProvider: contractDesc(
    aaveV2ProtocolDataProvider,
    // address from here:https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    mainnetAddresses.AAVE_V2_PROTOCOL_DATA_PROVIDER,
  ),
  aaveV2PriceOracle: contractDesc(
    aaveV2PriceOracle,
    // address from here:https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    mainnetAddresses.AAVE_V2_PRICE_ORACLE,
  ),
  chainlinkPriceOracle: {
    USDCUSD: contractDesc(
      chainLinkPriceOracle,
      // address from here:https://docs.chain.link/data-feeds/price-feeds/addresses
      mainnetAddresses.CHAINLINK_USDC_USD_PRICE_FEED,
    ),
    ETHUSD: contractDesc(chainLinkPriceOracle, mainnetAddresses.CHAINLINK_ETH_USD_PRICE_FEED),
  },
  aaveV2LendingPool: contractDesc(
    aaveV2LendingPool,
    mainnetAddresses.AAVE_V2_LENDING_POOL,
    AAVE_V2_LENDING_POOL_GENESIS_MAINNET,
  ),
  operationExecutor: contractDesc(operationExecutor, mainnetAddresses.OPERATION_EXECUTOR),
  swapAddress: mainnetAddresses.SWAP,
  accountFactory: contractDesc(
    accountFactory,
    mainnetAddresses.ACCOUNT_FACTORY,
    ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
  ),
  accountGuard: contractDesc(
    accountGuard,
    mainnetAddresses.ACCOUNT_GUARD,
    ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
  ),
  aaveV3Pool: contractDesc(aaveV3Pool, mainnetAddresses.AAVE_V3_POOL, AAVE_V3_POOL_GENESIS_MAINNET),
  aaveV3Oracle: contractDesc(aaveV3Oracle, mainnetAddresses.AAVE_V3_ORACLE),
  aaveV3PoolDataProvider: contractDesc(
    aaveV3PoolDataProvider,
    mainnetAddresses.AAVE_V3_POOL_DATA_PROVIDER,
  ),
  // TODO ajna addresses to be updated
  ajnaPoolInfo: contractDesc(ajnaPoolInfo, '0xD2D5e508C82EFc205cAFA4Ad969a4395Babce026'),
  ajnaProxyActions: contractDesc(ajnaProxyActions, '0x2b639Cc84e1Ad3aA92D4Ee7d2755A6ABEf300D72'),
  ajnaPoolPairs: {
    'WBTC-USDC': contractDesc(ajnaPool, '0xa11a3BCeaD7f27a19dAaaf59BC0484f8440e93fe'),
    'ETH-USDC': contractDesc(ajnaPool, '0x0c9Bc4EFD40cCD0B6c6372CFa8b8562A940185C1'),
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

export type MainnetContracts = typeof mainnetContracts
