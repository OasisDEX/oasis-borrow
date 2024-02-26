import { ADDRESSES } from '@oasisdex/addresses'
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
import { contractDesc, emptyContractDesc } from 'blockchain/networks'
import { tokensArbitrum } from 'blockchain/tokens/'
import { AAVE_V3_POOL_GENESIS_GOERLI } from 'blockchain/tokens/arbitrum'
import { supportedIlks } from 'blockchain/tokens/mainnet'
import { etherscanAPIKey } from 'config/runtimeConfig'

import type { MainnetContractsWithOptional } from './mainnet'
import { mainnetContracts } from './mainnet'

const { arbitrum } = ADDRESSES

export const arbitrumContracts: MainnetContractsWithOptional = {
  otc: contractDesc(otc, arbitrum.common.Otc),
  collaterals: getCollaterals(arbitrum.common, supportedIlks),
  tokens: tokensArbitrum,
  tokensMainnet: mainnetContracts.tokensMainnet,
  joins: {
    ...getCollateralJoinContracts(
      arbitrum.maker.joins,
      supportedIlks.filter(
        // these are not supported on goerli
        (ilk) => !['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A', 'GNO-A'].includes(ilk),
      ),
    ),
  },
  getCdps: contractDesc(getCdps, arbitrum.maker.common.GetCdps),
  mcdOsms: getOsms(arbitrum.maker.pips, supportedIlks),
  mcdJug: contractDesc(mcdJug, arbitrum.maker.common.Jug),
  mcdPot: contractDesc(mcdPot, arbitrum.maker.common.Pot),
  mcdEnd: contractDesc(mcdEnd, arbitrum.maker.common.End),
  mcdSpot: contractDesc(mcdSpot, arbitrum.maker.common.Spot),
  mcdDog: contractDesc(mcdDog, arbitrum.maker.common.Dog),
  mcdJoinDai: contractDesc(mcdJoinDai, arbitrum.maker.joins.MCD_JOIN_DAI),

  merkleRedeemer: contractDesc(merkleRedeemer, arbitrum.common.MerkleRedeemer),
  dssCharter: contractDesc(dssCharter, arbitrum.common.DssCharter),
  dssCdpManager: contractDesc(dssCdpManager, arbitrum.maker.common.CdpManager),
  otcSupportMethods: contractDesc(otcSupport, arbitrum.common.OtcSupportMethods),
  vat: contractDesc(vat, arbitrum.maker.common.Vat),
  dsProxyRegistry: contractDesc(dsProxyRegistry, arbitrum.mpa.core.DSProxyRegistry),
  dsProxyFactory: contractDesc(dsProxyFactory, arbitrum.mpa.core.DSProxyFactory),
  dssProxyActions: contractDesc(dssProxyActions, arbitrum.common.DssProxyActions),
  dssProxyActionsCharter: contractDesc(
    dssProxyActionsCharter,
    arbitrum.common.DssProxyActionsCharter,
  ),
  cdpRegistry: contractDesc(cdpRegistry, arbitrum.common.CdpRegistry),
  dssProxyActionsCropjoin: contractDesc(
    dssProxyActionsCropjoin,
    arbitrum.common.DssProxyActionsCropjoin,
  ),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    arbitrum.common.DssMultiplyProxyActions,
  ),
  guniProxyActions: contractDesc(guniProxyActions, arbitrum.common.GuniProxyActions), // TODO: add address
  dssCropper: contractDesc(dssCropper, arbitrum.common.DssCropper),
  guniResolver: arbitrum.common.GuniResolver,
  guniRouter: arbitrum.common.GuniRouter,

  automationBot: contractDesc(automationBot, arbitrum.automation.AutomationBot),
  automationBotV2: contractDesc(automationBotV2, arbitrum.automation.AutomationBotV2),
  automationBotAggregator: contractDesc(
    automationBotAggregator,
    arbitrum.automation.AutomationBotAggregator,
  ),

  serviceRegistry: arbitrum.common.ServiceRegistry,
  defaultExchange: contractDesc(exchange, arbitrum.common.DefaultExchange),
  noFeesExchange: contractDesc(exchange, arbitrum.common.NoFeesExchange),
  lowerFeesExchange: contractDesc(exchange, arbitrum.common.LowerFeesExchange),
  // Currently this is not supported on Goerli - no deployed contract
  fmm: arbitrum.maker.common.FlashMintModule,
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, arbitrum.common.DssProxyActionsDsr),
  lidoCrvLiquidityFarmingReward: contractDesc(
    lidoCrvLiquidityFarmingReward,
    arbitrum.common.LidoCrvLiquidityFarmingReward,
  ),
  aaveTokens: {},
  aaveV2ProtocolDataProvider: contractDesc(
    aaveV2ProtocolDataProvider,
    arbitrum.aave.v2.PoolDataProvider,
  ),
  aaveV2PriceOracle: contractDesc(aaveV2PriceOracle, arbitrum.aave.v2.Oracle),
  chainlinkPriceOracle: {
    USDCUSD: contractDesc(chainLinkPriceOracle, arbitrum.common.ChainlinkPriceOracle_USDCUSD),
    ETHUSD: contractDesc(chainLinkPriceOracle, arbitrum.common.ChainlinkPriceOracle_ETHUSD),
  },
  aaveV2LendingPool: emptyContractDesc('aaveV2LendingPool'),

  operationExecutor: contractDesc(operationExecutor, arbitrum.mpa.core.OperationExecutor),
  swapAddress: arbitrum.mpa.core.Swap,
  accountFactory: contractDesc(accountFactory, arbitrum.mpa.core.AccountFactory),
  accountGuard: contractDesc(accountGuard, arbitrum.mpa.core.AccountGuard),
  aaveV3Pool: contractDesc(aaveV3Pool, arbitrum.aave.v3.LendingPool, AAVE_V3_POOL_GENESIS_GOERLI),
  aaveV3Oracle: contractDesc(aaveV3Oracle, arbitrum.aave.v3.Oracle),
  aaveV3PoolDataProvider: contractDesc(aaveV3PoolDataProvider, arbitrum.aave.v3.PoolDataProvider),
  ajnaPoolInfo: contractDesc(ajnaPoolInfo, arbitrum.ajna.AjnaPoolInfo),
  ajnaProxyActions: contractDesc(ajnaProxyActions, arbitrum.ajna.AjnaProxyActions),
  ajnaPoolPairs: {
    'CBETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_CBETHETH),
    'CBETH-GHO': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_CBETHGHO),
    'ETH-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_ETHDAI),
    'ETH-GHO': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_ETHGHO),
    'ETH-USDC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_ETHUSDC),
    'GHO-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_GHODAI),
    'RETH-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_RETHDAI),
    'RETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_RETHETH),
    'CBETH-USDBC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_CBETHUSDBC),
    'RETH-GHO': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_RETHGHO),
    'RETH-USDC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_RETHUSDC),
    'SDAI-USDC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_SDAIUSDC),
    'TBTC-USDC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_TBTCUSDC),
    'TBTC-WBTC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_TBTCWBTC),
    'USDC-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_USDCETH),
    'USDC-WBTC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_USDCWBTC),
    'USDC-WLD': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_USDCWLD),
    'WBTC-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_WBTCDAI),
    'WBTC-GHO': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_WBTCGHO),
    'WBTC-USDC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_WBTCUSDC),
    'WLD-USDC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_WLDUSDC),
    'WSTETH-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_WSTETHDAI),
    'WSTETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_WSTETHETH),
    'WSTETH-GHO': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_WSTETHGHO),
    'WSTETH-USDC': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_WSTETHUSDC),
    'YFI-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_YFIDAI),
    'STYETH-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_STYETHDAI),
    'RBN-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_RBNETH),
    'AJNA-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_AJNADAI),
    'MKR-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_MKRDAI),

    'MEVETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_MEVETHWETH),
    'XETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_XETHWETH),
    'DETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_DETHWETH),
    'UNIETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_UNIETHWETH),
    'EZETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_EZETHWETH),
  },
  ajnaOraclessPoolPairs: {
    'YVCURVEUSDMSDAIF-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_YVCURVEUSDMSDAIFDAI),
    'MWSTETHWPUNKS20-WSTETH': contractDesc(
      ajnaPool,
      arbitrum.ajna.AjnaPoolPairs_MWSTETHWPUNKS20WSTETH,
    ),
    'MWSTETHWPUNKS40-WSTETH': contractDesc(
      ajnaPool,
      arbitrum.ajna.AjnaPoolPairs_MWSTETHWPUNKS40WSTETH,
    ),
    'APXETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_APXETHETH),
    'SUSDE-DAI': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_SUSDEDAI),
    'MPETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_MPETHWETH),
    'CSETH-ETH': contractDesc(ajnaPool, arbitrum.ajna.AjnaPoolPairs_CSETHWETH),
  },
  ajnaERC20PoolFactory: contractDesc(ajnaERC20PoolFactory, arbitrum.ajna.ERC20PoolFactory),
  ajnaRedeemer: contractDesc(ajnaReedemer, arbitrum.ajna.AjnaRewardsReedemer),
  ajnaBonusRedeemer: contractDesc(ajnaBonusRedeemer, arbitrum.ajna.AjnaBonusRewardsReedemer),
  morphoBlue: contractDesc(morphoBlue, arbitrum.morphoblue.MorphoBlue),
  adaptiveCurveIrm: contractDesc(morphoBlue, arbitrum.morphoblue.AdaptiveCurveIrm),
  balancerVault: contractDesc(balancerVault, arbitrum.common.BalancerVault),
  // NOT contracts
  cacheApi: 'not-implemented',
  safeConfirmations: 6,
  openVaultSafeConfirmations: 6,
  taxProxyRegistries: [],
  etherscan: {
    url: 'https://arbiscan.io',
    apiUrl: 'https://api.arbiscan.io/api',
    apiKey: etherscanAPIKey || '',
    name: 'Arbiscan',
  },
  magicLink: {
    apiKey: '',
  },
  SdaiOracle: contractDesc(ajnaPoolInfo, arbitrum.common.SdaiOracle),
  WSTETHOracle: contractDesc(ajnaPoolInfo, arbitrum.common.WSTETHOracle),
}
