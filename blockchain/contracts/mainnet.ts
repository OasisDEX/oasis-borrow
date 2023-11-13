import { ADDRESSES } from '@oasisdex/addresses'
import * as aaveV2LendingPool from 'blockchain/abi/aave-v2-lending-pool.json'
import * as aaveV2PriceOracle from 'blockchain/abi/aave-v2-price-oracle.json'
import * as aaveV2ProtocolDataProvider from 'blockchain/abi/aave-v2-protocol-data-provider.json'
import * as aaveV3Oracle from 'blockchain/abi/aave-v3-oracle.json'
import * as aaveV3Pool from 'blockchain/abi/aave-v3-pool.json'
import * as aaveV3PoolDataProvider from 'blockchain/abi/aave-v3-pool-data-provider.json'
import * as accountFactory from 'blockchain/abi/account-factory.json'
import * as accountGuard from 'blockchain/abi/account-guard.json'
import * as ajnaERC20PoolFactory from 'blockchain/abi/ajna-erc20-pool-factory.json'
import * as ajnaPool from 'blockchain/abi/ajna-pool.json'
import * as ajnaPoolInfo from 'blockchain/abi/ajna-pool-info.json'
import * as ajnaProxyActions from 'blockchain/abi/ajna-proxy-actions.json'
import * as automationBot from 'blockchain/abi/automation-bot.json'
import * as automationBotAggregator from 'blockchain/abi/automation-bot-aggregator.json'
import * as automationBotV2 from 'blockchain/abi/automation-bot-v2.json'
import * as balancerVault from 'blockchain/abi/balancer-vault.json'
import * as cdpRegistry from 'blockchain/abi/cdp-registry.json'
import * as chainLinkPriceOracle from 'blockchain/abi/chainlink-price-oracle.json'
import * as dsProxyFactory from 'blockchain/abi/ds-proxy-factory.json'
import * as dsProxyRegistry from 'blockchain/abi/ds-proxy-registry.json'
import * as dssCdpManager from 'blockchain/abi/dss-cdp-manager.json'
import * as dssCharter from 'blockchain/abi/dss-charter.json'
import * as dssCropper from 'blockchain/abi/dss-cropper.json'
import * as guniProxyActions from 'blockchain/abi/dss-guni-proxy-actions.json'
import * as dssProxyActions from 'blockchain/abi/dss-proxy-actions.json'
import * as dssProxyActionsCharter from 'blockchain/abi/dss-proxy-actions-charter.json'
import * as dssProxyActionsCropjoin from 'blockchain/abi/dss-proxy-actions-cropjoin.json'
import * as dssProxyActionsDsr from 'blockchain/abi/dss-proxy-actions-dsr.json'
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
import * as sparkV3Oracle from 'blockchain/abi/spark-v3-oracle.json'
import * as sparkV3Pool from 'blockchain/abi/spark-v3-pool.json'
import * as sparkV3PoolDataProvider from 'blockchain/abi/spark-v3-pool-data-provider.json'
import * as vat from 'blockchain/abi/vat.json'
import {
  getCollateralJoinContracts,
  getCollaterals,
  getOsms,
} from 'blockchain/addresses/addressesUtils'
import { contractDesc, emptyContractDesc } from 'blockchain/networks'
import {
  AAVE_V2_LENDING_POOL_GENESIS_MAINNET,
  AAVE_V3_POOL_GENESIS_MAINNET,
  ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
  SPARK_V3_LENDING_POOL_GENESIS_MAINNET,
  SPARK_V3_ORACLE_GENESIS_MAINNET,
  SPARK_V3_POOL_DATA_PROVIDER_GENESIS_MAINNET,
  supportedIlks,
  tokensMainnet,
} from 'blockchain/tokens/mainnet'
import { etherscanAPIKey, mainnetCacheUrl } from 'config/runtimeConfig'
import type { Optional } from 'helpers/types'

import type { OptionalContracts } from './optional-contracts'

const { mainnet } = ADDRESSES

export const mainnetContracts = {
  collaterals: getCollaterals(mainnet.common, supportedIlks),
  joins: {
    ...getCollateralJoinContracts(mainnet.maker.joins, supportedIlks),
  },
  mcdOsms: getOsms(mainnet.maker.pips, supportedIlks),
  tokens: tokensMainnet,
  tokensMainnet,
  otc: contractDesc(otc, mainnet.common.Otc),
  otcSupportMethods: contractDesc(otcSupport, mainnet.common.OtcSupportMethods),
  getCdps: contractDesc(getCdps, mainnet.maker.common.GetCdps),
  mcdJug: contractDesc(mcdJug, mainnet.maker.common.Jug),
  mcdPot: contractDesc(mcdPot, mainnet.maker.common.Pot),
  mcdEnd: contractDesc(mcdEnd, mainnet.maker.common.End),
  mcdSpot: contractDesc(mcdSpot, mainnet.maker.common.Spot),
  mcdDog: contractDesc(mcdDog, mainnet.maker.common.Dog),
  merkleRedeemer: contractDesc(merkleRedeemer, mainnet.common.MerkleRedeemer),
  dssCharter: contractDesc(dssCharter, mainnet.common.DssCharter),
  dssCdpManager: contractDesc(dssCdpManager, mainnet.maker.common.CdpManager),
  vat: contractDesc(vat, mainnet.maker.common.Vat),
  mcdJoinDai: contractDesc(mcdJoinDai, mainnet.maker.joins.MCD_JOIN_DAI),
  dsProxyRegistry: contractDesc(dsProxyRegistry, mainnet.mpa.core.DSProxyRegistry),
  dsProxyFactory: contractDesc(dsProxyFactory, mainnet.mpa.core.DSProxyFactory),
  dssProxyActions: contractDesc(dssProxyActions, mainnet.common.DssProxyActions),
  dssProxyActionsCharter: contractDesc(
    dssProxyActionsCharter,
    mainnet.common.DssProxyActionsCharter,
  ),
  automationBot: contractDesc(automationBot, mainnet.automation.AutomationBot),
  automationBotV2: contractDesc(automationBotV2, mainnet.automation.AutomationBotV2),
  automationBotAggregator: contractDesc(
    automationBotAggregator,
    mainnet.automation.AutomationBotAggregator,
  ),
  serviceRegistry: mainnet.common.ServiceRegistry,
  guniProxyActions: contractDesc(guniProxyActions, mainnet.common.GuniProxyActions),
  guniResolver: mainnet.common.GuniResolver,
  guniRouter: mainnet.common.GuniRouter,
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    mainnet.common.DssMultiplyProxyActions,
  ),
  dssCropper: contractDesc(dssCropper, mainnet.common.DssCropper),
  cdpRegistry: contractDesc(cdpRegistry, mainnet.common.CdpRegistry),
  dssProxyActionsCropjoin: contractDesc(
    dssProxyActionsCropjoin,
    mainnet.common.DssProxyActionsCropjoin,
  ),
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, mainnet.common.DssProxyActionsDsr),
  defaultExchange: contractDesc(exchange, mainnet.common.DefaultExchange),
  noFeesExchange: contractDesc(exchange, mainnet.common.NoFeesExchange),
  lowerFeesExchange: contractDesc(exchange, mainnet.common.LowerFeesExchange),
  fmm: mainnet.maker.common.FlashMintModule,
  lidoCrvLiquidityFarmingReward: contractDesc(
    lidoCrvLiquidityFarmingReward,
    mainnet.common.LidoCrvLiquidityFarmingReward,
  ),
  aaveTokens: {
    STETH: mainnet.common.STETH,
  } as Record<string, string>,
  aaveV2ProtocolDataProvider: contractDesc(
    aaveV2ProtocolDataProvider,
    mainnet.aave.v2.PoolDataProvider,
  ),
  aaveV2PriceOracle: contractDesc(aaveV2PriceOracle, mainnet.aave.v2.Oracle),
  chainlinkPriceOracle: {
    USDCUSD: contractDesc(chainLinkPriceOracle, mainnet.common.ChainlinkPriceOracle_USDCUSD),
    ETHUSD: contractDesc(chainLinkPriceOracle, mainnet.common.ChainlinkPriceOracle_ETHUSD),
    CBETHUSD: emptyContractDesc('chainLinkPriceOracle'),
  },
  aaveV2LendingPool: contractDesc(
    aaveV2LendingPool,
    mainnet.aave.v2.LendingPool,
    AAVE_V2_LENDING_POOL_GENESIS_MAINNET,
  ),
  operationExecutor: contractDesc(operationExecutor, mainnet.mpa.core.OperationExecutor),
  swapAddress: mainnet.mpa.core.Swap,
  accountFactory: contractDesc(
    accountFactory,
    mainnet.mpa.core.AccountFactory,
    ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
  ),
  accountGuard: contractDesc(
    accountGuard,
    mainnet.mpa.core.AccountGuard,
    ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
  ),
  aaveV3Pool: contractDesc(aaveV3Pool, mainnet.aave.v3.LendingPool, AAVE_V3_POOL_GENESIS_MAINNET),
  aaveV3Oracle: contractDesc(aaveV3Oracle, mainnet.aave.v3.Oracle),
  aaveV3PoolDataProvider: contractDesc(aaveV3PoolDataProvider, mainnet.aave.v3.PoolDataProvider),
  sparkV3Pool: contractDesc(
    sparkV3Pool,
    mainnet.spark.LendingPool!,
    SPARK_V3_LENDING_POOL_GENESIS_MAINNET,
  ),
  sparkV3Oracle: contractDesc(
    sparkV3Oracle,
    mainnet.spark.Oracle!,
    SPARK_V3_ORACLE_GENESIS_MAINNET,
  ),
  sparkV3PoolDataProvider: contractDesc(
    sparkV3PoolDataProvider,
    mainnet.spark.PoolDataProvider!,
    SPARK_V3_POOL_DATA_PROVIDER_GENESIS_MAINNET,
  ),
  // TODO ajna addresses to be updated
  ajnaPoolInfo: contractDesc(ajnaPoolInfo, mainnet.ajna.AjnaPoolInfo),
  ajnaProxyActions: contractDesc(ajnaProxyActions, mainnet.ajna.AjnaProxyActions),
  ajnaPoolPairs: {
    'CBETH-ETH': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_CBETHETH),
    'CBETH-GHO': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_CBETHGHO),
    'ETH-DAI': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_ETHDAI),
    'ETH-GHO': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_ETHGHO),
    'ETH-USDC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_ETHUSDC),
    'GHO-DAI': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_GHODAI),
    'RETH-DAI': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_RETHDAI),
    'RETH-ETH': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_RETHETH),
    'RETH-GHO': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_RETHGHO),
    'RETH-USDC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_RETHUSDC),
    'SDAI-USDC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_SDAIUSDC),
    'TBTC-USDC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_TBTCUSDC),
    'TBTC-WBTC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_TBTCWBTC),
    'USDC-ETH': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_USDCETH),
    'USDC-WBTC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_USDCWBTC),
    'USDC-WLD': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_USDCWLD),
    'WBTC-DAI': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_WBTCDAI),
    'WBTC-GHO': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_WBTCGHO),
    'WBTC-USDC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_WBTCUSDC),
    'WLD-USDC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_WLDUSDC),
    'WSTETH-DAI': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_WSTETHDAI),
    'WSTETH-ETH': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_WSTETHETH),
    'WSTETH-GHO': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_WSTETHGHO),
    'WSTETH-USDC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_WSTETHUSDC),
    'YFI-DAI': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_YFIDAI),
  },
  ajnaOraclessPoolPairs: {
    'YIELDBTC-WBTC': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_YIELDBTCWBTC),
    'YIELDETH-ETH': contractDesc(ajnaPool, mainnet.ajna.AjnaPoolPairs_YIELDETHETH),
  },
  ajnaERC20PoolFactory: contractDesc(ajnaERC20PoolFactory, mainnet.ajna.ERC20PoolFactory),
  balancerVault: contractDesc(balancerVault, mainnet.common.BalancerVault),
  // not contracts
  cacheApi: mainnetCacheUrl,
  safeConfirmations: 10,
  openVaultSafeConfirmations: 6,
  taxProxyRegistries: [],
  etherscan: {
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  ethtx: {
    url: 'https://ethtx.info/mainnet',
  },
  magicLink: {
    apiKey: '',
  },
  SdaiOracle: contractDesc(ajnaPoolInfo, mainnet.common.SdaiOracle),
}

type DeprecatedProperties = {
  /*
   * @deprecated use `tokens` instead
   */
  tokensMainnet: typeof tokensMainnet
}

export type MainnetContracts = typeof mainnetContracts & DeprecatedProperties
export type MainnetContractsWithOptional = Optional<MainnetContracts, OptionalContracts>
