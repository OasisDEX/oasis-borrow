import { ADDRESSES } from '@oasisdex/addresses'
import * as aaveV2LendingPool from 'blockchain/abi/aave-v2-lending-pool.json'
import * as aaveV2PriceOracle from 'blockchain/abi/aave-v2-price-oracle.json'
import * as aaveV2ProtocolDataProvider from 'blockchain/abi/aave-v2-protocol-data-provider.json'
import * as aaveV3Oracle from 'blockchain/abi/aave-v3-oracle.json'
import * as aaveV3Pool from 'blockchain/abi/aave-v3-pool.json'
import * as aaveV3PoolDataProvider from 'blockchain/abi/aave-v3-pool-data-provider.json'
import * as accountFactory from 'blockchain/abi/account-factory.json'
import * as accountGuard from 'blockchain/abi/account-guard.json'
import * as ajnaBonusRedeemer from 'blockchain/abi/ajna-bonus-redeemer.json'
import * as ajnaERC20PoolFactory from 'blockchain/abi/ajna-erc20-pool-factory.json'
import * as ajnaPool from 'blockchain/abi/ajna-pool.json'
import * as ajnaPoolInfo from 'blockchain/abi/ajna-pool-info.json'
import * as ajnaProxyActions from 'blockchain/abi/ajna-proxy-actions.json'
import * as ajnaReedemer from 'blockchain/abi/ajna-reedemer.json'
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
import * as morphoBlue from 'blockchain/abi/morpho-blue.json'
import * as dssMultiplyProxyActions from 'blockchain/abi/multiply-proxy-actions.json'
import * as operationExecutor from 'blockchain/abi/operation-executor.json'
import * as otcSupport from 'blockchain/abi/otc-support-methods.json'
import * as vat from 'blockchain/abi/vat.json'
import {
  getCollateralJoinContracts,
  getCollaterals,
  getOsms,
} from 'blockchain/addresses/addressesUtils'
import { contractDesc } from 'blockchain/networks'
import {
  AAVE_V2_LENDING_POOL_GENESIS_GOERLI,
  AAVE_V3_POOL_GENESIS_GOERLI,
  ACCOUNT_GUARD_FACTORY_GENESIS_GOERLI,
  tokensGoerli,
} from 'blockchain/tokens/goerli'
import { supportedIlks } from 'blockchain/tokens/mainnet'
import { etherscanAPIKey } from 'config/runtimeConfig'

import type { MainnetContractsWithOptional } from './mainnet'
import { mainnetContracts } from './mainnet'

const { goerli } = ADDRESSES

export const goerliContracts: MainnetContractsWithOptional = {
  otc: contractDesc(otc, goerli.common.Otc),
  collaterals: getCollaterals(goerli.common, supportedIlks),
  tokens: tokensGoerli,
  tokensMainnet: mainnetContracts.tokensMainnet,
  joins: {
    ...getCollateralJoinContracts(
      goerli.maker.joins,
      supportedIlks.filter(
        // these are not supported on goerli
        (ilk) => !['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A', 'GNO-A'].includes(ilk),
      ),
    ),
  },
  getCdps: contractDesc(getCdps, goerli.maker.common.GetCdps),
  mcdOsms: getOsms(goerli.maker.pips, supportedIlks),
  mcdJug: contractDesc(mcdJug, goerli.maker.common.Jug),
  mcdPot: contractDesc(mcdPot, goerli.maker.common.Pot),
  mcdEnd: contractDesc(mcdEnd, goerli.maker.common.End),
  mcdSpot: contractDesc(mcdSpot, goerli.maker.common.Spot),
  mcdDog: contractDesc(mcdDog, goerli.maker.common.Dog),
  mcdJoinDai: contractDesc(mcdJoinDai, goerli.maker.joins.MCD_JOIN_DAI),

  merkleRedeemer: contractDesc(merkleRedeemer, goerli.common.MerkleRedeemer),
  dssCharter: contractDesc(dssCharter, goerli.common.DssCharter),
  dssCdpManager: contractDesc(dssCdpManager, goerli.maker.common.CdpManager),
  otcSupportMethods: contractDesc(otcSupport, goerli.common.OtcSupportMethods),
  vat: contractDesc(vat, goerli.maker.common.Vat),
  dsProxyRegistry: contractDesc(dsProxyRegistry, goerli.mpa.core.DSProxyRegistry),
  dsProxyFactory: contractDesc(dsProxyFactory, goerli.mpa.core.DSProxyFactory),
  dssProxyActions: contractDesc(dssProxyActions, goerli.common.DssProxyActions),
  dssProxyActionsCharter: contractDesc(
    dssProxyActionsCharter,
    goerli.common.DssProxyActionsCharter,
  ),
  cdpRegistry: contractDesc(cdpRegistry, goerli.common.CdpRegistry),
  dssProxyActionsCropjoin: contractDesc(
    dssProxyActionsCropjoin,
    goerli.common.DssProxyActionsCropjoin,
  ),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    goerli.common.DssMultiplyProxyActions,
  ),
  guniProxyActions: contractDesc(guniProxyActions, goerli.common.GuniProxyActions), // TODO: add address
  dssCropper: contractDesc(dssCropper, goerli.common.DssCropper),
  guniResolver: goerli.common.GuniResolver,
  guniRouter: goerli.common.GuniRouter,

  automationBot: contractDesc(automationBot, goerli.automation.AutomationBot),
  automationBotV2: contractDesc(automationBotV2, goerli.automation.AutomationBotV2),
  automationBotAggregator: contractDesc(
    automationBotAggregator,
    goerli.automation.AutomationBotAggregator,
  ),

  serviceRegistry: goerli.common.ServiceRegistry,
  defaultExchange: contractDesc(exchange, goerli.common.DefaultExchange),
  noFeesExchange: contractDesc(exchange, goerli.common.NoFeesExchange),
  lowerFeesExchange: contractDesc(exchange, goerli.common.LowerFeesExchange),
  // Currently this is not supported on Goerli - no deployed contract
  fmm: goerli.maker.common.FlashMintModule,
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, goerli.common.DssProxyActionsDsr),
  lidoCrvLiquidityFarmingReward: contractDesc(
    lidoCrvLiquidityFarmingReward,
    goerli.common.LidoCrvLiquidityFarmingReward,
  ),
  aaveTokens: {},
  aaveV2ProtocolDataProvider: contractDesc(
    aaveV2ProtocolDataProvider,
    goerli.aave.v2.PoolDataProvider,
  ),
  aaveV2PriceOracle: contractDesc(aaveV2PriceOracle, goerli.aave.v2.Oracle),
  chainlinkPriceOracle: {
    USDCUSD: contractDesc(chainLinkPriceOracle, goerli.common.ChainlinkPriceOracle_USDCUSD),
    ETHUSD: contractDesc(chainLinkPriceOracle, goerli.common.ChainlinkPriceOracle_ETHUSD),
  },
  aaveV2LendingPool: contractDesc(
    aaveV2LendingPool,
    goerli.aave.v2.LendingPool,
    AAVE_V2_LENDING_POOL_GENESIS_GOERLI,
  ),

  operationExecutor: contractDesc(operationExecutor, goerli.mpa.core.OperationExecutor),
  swapAddress: goerli.mpa.core.Swap,
  accountFactory: contractDesc(
    accountFactory,
    goerli.mpa.core.AccountFactory,
    ACCOUNT_GUARD_FACTORY_GENESIS_GOERLI,
  ),
  accountGuard: contractDesc(
    accountGuard,
    goerli.mpa.core.AccountGuard,
    ACCOUNT_GUARD_FACTORY_GENESIS_GOERLI,
  ),
  aaveV3Pool: contractDesc(aaveV3Pool, goerli.aave.v3.LendingPool, AAVE_V3_POOL_GENESIS_GOERLI),
  aaveV3Oracle: contractDesc(aaveV3Oracle, goerli.aave.v3.Oracle),
  aaveV3PoolDataProvider: contractDesc(aaveV3PoolDataProvider, goerli.aave.v3.PoolDataProvider),
  ajnaPoolInfo: contractDesc(ajnaPoolInfo, goerli.ajna.AjnaPoolInfo),
  ajnaProxyActions: contractDesc(ajnaProxyActions, goerli.ajna.AjnaProxyActions),
  ajnaPoolPairs: {
    'CBETH-ETH': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_CBETHETH),
    'CBETH-GHO': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_CBETHGHO),
    'ETH-DAI': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_ETHDAI),
    'ETH-GHO': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_ETHGHO),
    'ETH-USDC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_ETHUSDC),
    'GHO-DAI': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_GHODAI),
    'RETH-DAI': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_RETHDAI),
    'RETH-ETH': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_RETHETH),
    'CBETH-USDBC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_CBETHUSDBC),
    'RETH-GHO': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_RETHGHO),
    'RETH-USDC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_RETHUSDC),
    'SDAI-USDC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_SDAIUSDC),
    'TBTC-USDC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_TBTCUSDC),
    'TBTC-WBTC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_TBTCWBTC),
    'USDC-ETH': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_USDCETH),
    'USDC-WBTC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_USDCWBTC),
    'USDC-WLD': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_USDCWLD),
    'WBTC-DAI': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_WBTCDAI),
    'WBTC-GHO': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_WBTCGHO),
    'WBTC-USDC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_WBTCUSDC),
    'WLD-USDC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_WLDUSDC),
    'WSTETH-DAI': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_WSTETHDAI),
    'WSTETH-ETH': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_WSTETHETH),
    'WSTETH-GHO': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_WSTETHGHO),
    'WSTETH-USDC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_WSTETHUSDC),
    'YFI-DAI': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_YFIDAI),
    'STYETH-DAI': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_STYETHDAI),
    'RBN-ETH': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_RBNETH),
    'AJNA-DAI': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_AJNADAI),
  },
  ajnaOraclessPoolPairs: {
    'YIELDBTC-WBTC': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_YIELDBTCWBTC),
    'YIELDETH-ETH': contractDesc(ajnaPool, goerli.ajna.AjnaPoolPairs_YIELDETHETH),
  },
  ajnaERC20PoolFactory: contractDesc(ajnaERC20PoolFactory, goerli.ajna.ERC20PoolFactory),
  ajnaRedeemer: contractDesc(ajnaReedemer, goerli.ajna.AjnaRewardsReedemer),
  ajnaBonusRedeemer: contractDesc(ajnaBonusRedeemer, goerli.ajna.AjnaBonusRewardsReedemer),
  morphoBlue: contractDesc(morphoBlue, goerli.morphoblue.MorphoBlue),
  adaptiveCurveIrm: contractDesc(morphoBlue, goerli.morphoblue.AdaptiveCurveIrm),
  balancerVault: contractDesc(balancerVault, goerli.common.BalancerVault),
  // NOT contracts
  cacheApi: 'https://cache-goerli-staging.staging.summer.fi/api/v1',
  safeConfirmations: 6,
  openVaultSafeConfirmations: 6,
  taxProxyRegistries: [],
  etherscan: {
    url: 'https://goerli.etherscan.io',
    apiUrl: 'https://api-goerli.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
    name: 'Etherscan',
  },
  magicLink: {
    apiKey: '',
  },
  SdaiOracle: contractDesc(ajnaPoolInfo, goerli.common.SdaiOracle),
  WSTETHOracle: contractDesc(ajnaPoolInfo, goerli.common.WSTETHOracle),
}
