import { ADDRESSES } from '@oasisdex/addresses'
import * as aaveV2PriceOracle from 'blockchain/abi/aave-v2-price-oracle.json'
import * as aaveV2ProtocolDataProvider from 'blockchain/abi/aave-v2-protocol-data-provider.json'
import * as aaveV3Oracle from 'blockchain/abi/aave-v3-oracle.json'
import * as aaveV3PoolDataProvider from 'blockchain/abi/aave-v3-pool-data-provider.json'
import * as aaveV3Pool from 'blockchain/abi/aave-v3-pool.json'
import * as accountFactory from 'blockchain/abi/account-factory.json'
import * as accountGuard from 'blockchain/abi/account-guard.json'
import * as ajnaERC20PoolFactory from 'blockchain/abi/ajna-erc20-pool-factory.json'
import * as ajnaPoolInfo from 'blockchain/abi/ajna-pool-info.json'
import * as ajnaProxyActions from 'blockchain/abi/ajna-proxy-actions.json'
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
import * as gasPriceOracle from 'blockchain/abi/gas-price-oracle.json'
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
import { contractDesc, contractDescWithoutAbi, emptyContractDesc } from 'blockchain/networks'
import { supportedIlks } from 'blockchain/tokens/mainnet'
import {
  AAVE_V3_POOL_GENESIS_OPTIMISM_MAINNET,
  ACCOUNT_FACTORY_GENESIS_OPTIMISM_MAINNET,
  ACCOUNT_GUARD_GENESIS_OPTIMISM_MAINNET,
  tokensOptimism,
} from 'blockchain/tokens/optimism'
import { etherscanAPIKey } from 'config/runtimeConfig'
import type { ContractDesc } from 'features/web3Context'

import type { MainnetContractsWithOptional } from './mainnet'
import { mainnetContracts } from './mainnet'

const { optimism } = ADDRESSES

type OptimismContracts = MainnetContractsWithOptional & {
  gasPriceOracle: ContractDesc
}

export const optimismContracts: OptimismContracts = {
  otc: contractDesc(otc, optimism.common.Otc),
  collaterals: getCollaterals(optimism.common, supportedIlks),
  tokens: tokensOptimism,
  tokensMainnet: mainnetContracts.tokensMainnet,
  joins: {
    ...getCollateralJoinContracts(
      optimism.maker.joins,
      supportedIlks.filter(
        // these are not supported on goerli
        (ilk) => !['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A', 'GNO-A'].includes(ilk),
      ),
    ),
  },
  getCdps: contractDesc(getCdps, optimism.maker.common.GetCdps),
  mcdOsms: getOsms(optimism.maker.pips, supportedIlks),
  mcdJug: contractDesc(mcdJug, optimism.maker.common.Jug),
  mcdPot: contractDesc(mcdPot, optimism.maker.common.Pot),
  mcdEnd: contractDesc(mcdEnd, optimism.maker.common.End),
  mcdSpot: contractDesc(mcdSpot, optimism.maker.common.Spot),
  mcdDog: contractDesc(mcdDog, optimism.maker.common.Dog),
  mcdJoinDai: contractDesc(mcdJoinDai, optimism.maker.joins.MCD_JOIN_DAI),

  merkleRedeemer: contractDesc(merkleRedeemer, optimism.common.MerkleRedeemer),
  dssCharter: contractDesc(dssCharter, optimism.common.DssCharter),
  dssCdpManager: contractDesc(dssCdpManager, optimism.maker.common.CdpManager),
  otcSupportMethods: contractDesc(otcSupport, optimism.common.OtcSupportMethods),
  vat: contractDesc(vat, optimism.maker.common.Vat),
  dsProxyRegistry: contractDesc(dsProxyRegistry, optimism.mpa.core.DSProxyRegistry),
  dsProxyFactory: contractDesc(dsProxyFactory, optimism.mpa.core.DSProxyFactory),
  dssProxyActions: contractDesc(dssProxyActions, optimism.common.DssProxyActions),
  dssProxyActionsCharter: contractDesc(
    dssProxyActionsCharter,
    optimism.common.DssProxyActionsCharter,
  ),
  cdpRegistry: contractDesc(cdpRegistry, optimism.common.CdpRegistry),
  dssProxyActionsCropjoin: contractDesc(
    dssProxyActionsCropjoin,
    optimism.common.DssProxyActionsCropjoin,
  ),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    optimism.common.DssMultiplyProxyActions,
  ),
  guniProxyActions: contractDesc(guniProxyActions, optimism.common.GuniProxyActions), // TODO: add address
  dssCropper: contractDesc(dssCropper, optimism.common.DssCropper),
  guniResolver: optimism.common.GuniResolver,
  guniRouter: optimism.common.GuniRouter,

  automationBot: contractDesc(automationBot, optimism.automation.AutomationBot),
  automationBotV2: contractDesc(automationBotV2, optimism.automation.AutomationBotV2),
  automationBotAggregator: contractDesc(
    automationBotAggregator,
    optimism.automation.AutomationBotAggregator,
  ),

  serviceRegistry: optimism.common.ServiceRegistry,
  defaultExchange: contractDesc(exchange, optimism.common.DefaultExchange),
  noFeesExchange: contractDesc(exchange, optimism.common.NoFeesExchange),
  lowerFeesExchange: contractDesc(exchange, optimism.common.LowerFeesExchange),
  // Currently this is not supported on Goerli - no deployed contract
  fmm: optimism.maker.common.FlashMintModule,
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, optimism.common.DssProxyActionsDsr),
  lidoCrvLiquidityFarmingReward: contractDesc(
    lidoCrvLiquidityFarmingReward,
    optimism.common.LidoCrvLiquidityFarmingReward,
  ),
  aaveTokens: {},
  aaveV2ProtocolDataProvider: contractDesc(
    aaveV2ProtocolDataProvider,
    optimism.aave.v2.PoolDataProvider,
  ),
  aaveV2PriceOracle: contractDesc(aaveV2PriceOracle, optimism.aave.v2.Oracle),
  chainlinkPriceOracle: {
    USDCUSD: contractDesc(chainLinkPriceOracle, optimism.common.ChainlinkPriceOracle_USDCUSD),
    ETHUSD: contractDesc(chainLinkPriceOracle, optimism.common.ChainlinkPriceOracle_ETHUSD),
  },
  aaveV2LendingPool: emptyContractDesc('aaveV2LendingPool'),

  operationExecutor: contractDesc(operationExecutor, optimism.mpa.core.OperationExecutor),
  swapAddress: optimism.mpa.core.Swap,
  accountFactory: contractDesc(
    accountFactory,
    optimism.mpa.core.AccountFactory,
    ACCOUNT_FACTORY_GENESIS_OPTIMISM_MAINNET,
  ),
  accountGuard: contractDesc(
    accountGuard,
    optimism.mpa.core.AccountGuard,
    ACCOUNT_GUARD_GENESIS_OPTIMISM_MAINNET,
  ),
  aaveV3Pool: contractDesc(
    aaveV3Pool,
    optimism.aave.v3.LendingPool,
    AAVE_V3_POOL_GENESIS_OPTIMISM_MAINNET,
  ),
  aaveV3Oracle: contractDesc(aaveV3Oracle, optimism.aave.v3.Oracle),
  aaveV3PoolDataProvider: contractDesc(aaveV3PoolDataProvider, optimism.aave.v3.PoolDataProvider),
  ajnaPoolInfo: contractDesc(ajnaPoolInfo, optimism.ajna.AjnaPoolInfo),
  ajnaProxyActions: contractDesc(ajnaProxyActions, optimism.ajna.AjnaProxyActions),
  ajnaPoolPairs: {
    'CBETH-ETH': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_CBETHETH),
    'CBETH-GHO': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_CBETHGHO),
    'ETH-DAI': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_ETHDAI),
    'ETH-GHO': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_ETHGHO),
    'ETH-USDC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_ETHUSDC),
    'GHO-DAI': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_GHODAI),
    'RETH-DAI': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_RETHDAI),
    'RETH-ETH': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_RETHETH),
    'RETH-GHO': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_RETHGHO),
    'RETH-USDC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_RETHUSDC),
    'SDAI-USDC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_SDAIUSDC),
    'TBTC-USDC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_TBTCUSDC),
    'TBTC-WBTC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_TBTCWBTC),
    'USDC-ETH': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_USDCETH),
    'USDC-WBTC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_USDCWBTC),
    'USDC-WLD': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_USDCWLD),
    'WBTC-DAI': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_WBTCDAI),
    'WBTC-GHO': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_WBTCGHO),
    'WBTC-USDC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_WBTCUSDC),
    'WLD-USDC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_WLDUSDC),
    'WSTETH-DAI': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_WSTETHDAI),
    'WSTETH-ETH': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_WSTETHETH),
    'WSTETH-GHO': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_WSTETHGHO),
    'WSTETH-USDC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_WSTETHUSDC),
    'YFI-DAI': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_YFIDAI),
  },
  ajnaOraclessPoolPairs: {
    'YIELDBTC-WBTC': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_YIELDBTCWBTC),
    'YIELDETH-ETH': contractDescWithoutAbi(optimism.ajna.AjnaPoolPairs_YIELDETHETH),
  },
  ajnaERC20PoolFactory: contractDesc(ajnaERC20PoolFactory, optimism.ajna.ERC20PoolFactory),
  balancerVault: contractDescWithoutAbi(optimism.common.BalancerVault),
  // NOT contracts
  cacheApi: 'not-implemented',
  safeConfirmations: 6,
  openVaultSafeConfirmations: 6,
  taxProxyRegistries: [],
  etherscan: {
    url: 'https://optimistic.etherscan.io/',
    apiUrl: 'https://api-optimistic.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  ethtx: {
    url: '',
  },
  magicLink: {
    apiKey: '',
  },
  gasPriceOracle: contractDesc(gasPriceOracle, '0x420000000000000000000000000000000000000F'),
  SdaiOracle: contractDesc(ajnaPoolInfo, optimism.common.SdaiOracle),
}
