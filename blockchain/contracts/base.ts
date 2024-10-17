import { ADDRESSES } from '@oasisdex/addresses'
import * as aaveLikeRewardsProxyActions from 'blockchain/abi/aave-like-rewards-proxy-actions.json'
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
import * as erc20proxyActions from 'blockchain/abi/erc20-proxy-actions.json'
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
import { tokensBase } from 'blockchain/tokens/base'
import { supportedIlks } from 'blockchain/tokens/mainnet'
import { etherscanAPIKey } from 'config/runtimeConfig'

import type { MainnetContractsWithOptional } from './mainnet'
import { mainnetContracts } from './mainnet'

const { base } = ADDRESSES

export const baseContracts: MainnetContractsWithOptional = {
  otc: contractDesc(otc, base.common.Otc),
  collaterals: getCollaterals(base.common, supportedIlks),
  tokens: tokensBase,
  tokensMainnet: mainnetContracts.tokensMainnet,
  joins: {
    ...getCollateralJoinContracts(
      base.maker.joins,
      supportedIlks.filter(
        // these are not supported on goerli
        (ilk) => !['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A', 'GNO-A'].includes(ilk),
      ),
    ),
  },
  getCdps: contractDesc(getCdps, base.maker.common.GetCdps),
  mcdOsms: getOsms(base.maker.pips, supportedIlks),
  mcdJug: contractDesc(mcdJug, base.maker.common.Jug),
  mcdPot: contractDesc(mcdPot, base.maker.common.Pot),
  mcdEnd: contractDesc(mcdEnd, base.maker.common.End),
  mcdSpot: contractDesc(mcdSpot, base.maker.common.Spot),
  mcdDog: contractDesc(mcdDog, base.maker.common.Dog),
  mcdJoinDai: contractDesc(mcdJoinDai, base.maker.joins.MCD_JOIN_DAI),

  merkleRedeemer: contractDesc(merkleRedeemer, base.common.MerkleRedeemer),
  dssCharter: contractDesc(dssCharter, base.common.DssCharter),
  dssCdpManager: contractDesc(dssCdpManager, base.maker.common.CdpManager),
  otcSupportMethods: contractDesc(otcSupport, base.common.OtcSupportMethods),
  vat: contractDesc(vat, base.maker.common.Vat),
  dsProxyRegistry: contractDesc(dsProxyRegistry, base.mpa.core.DSProxyRegistry),
  dsProxyFactory: contractDesc(dsProxyFactory, base.mpa.core.DSProxyFactory),
  dssProxyActions: contractDesc(dssProxyActions, base.common.DssProxyActions),
  dssProxyActionsCharter: contractDesc(dssProxyActionsCharter, base.common.DssProxyActionsCharter),
  cdpRegistry: contractDesc(cdpRegistry, base.common.CdpRegistry),
  dssProxyActionsCropjoin: contractDesc(
    dssProxyActionsCropjoin,
    base.common.DssProxyActionsCropjoin,
  ),
  dssMultiplyProxyActions: contractDesc(
    dssMultiplyProxyActions,
    base.common.DssMultiplyProxyActions,
  ),
  guniProxyActions: contractDesc(guniProxyActions, base.common.GuniProxyActions), // TODO: add address
  dssCropper: contractDesc(dssCropper, base.common.DssCropper),
  guniResolver: base.common.GuniResolver,
  guniRouter: base.common.GuniRouter,

  automationBot: contractDesc(automationBot, base.automation.AutomationBot),
  automationBotV2: contractDesc(automationBotV2, base.automation.AutomationBotV2),
  automationBotAggregator: contractDesc(
    automationBotAggregator,
    base.automation.AutomationBotAggregator,
  ),

  serviceRegistry: base.common.ServiceRegistry,
  defaultExchange: contractDesc(exchange, base.common.DefaultExchange),
  noFeesExchange: contractDesc(exchange, base.common.NoFeesExchange),
  lowerFeesExchange: contractDesc(exchange, base.common.LowerFeesExchange),
  // Currently this is not supported on Goerli - no deployed contract
  fmm: base.maker.common.FlashMintModule,
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, base.common.DssProxyActionsDsr),
  lidoCrvLiquidityFarmingReward: contractDesc(
    lidoCrvLiquidityFarmingReward,
    base.common.LidoCrvLiquidityFarmingReward,
  ),
  aaveTokens: {},
  aaveV2ProtocolDataProvider: contractDesc(
    aaveV2ProtocolDataProvider,
    base.aave.v2.PoolDataProvider,
  ),
  aaveV2PriceOracle: contractDesc(aaveV2PriceOracle, base.aave.v2.Oracle),
  chainlinkPriceOracle: {
    USDCUSD: emptyContractDesc('chainLinkPriceOracle'),
    ETHUSD: emptyContractDesc('chainLinkPriceOracle'),
    BTCUSD: contractDesc(chainLinkPriceOracle, base.common.ChainlinkPriceOracle_BTCUSD),
  },
  aaveV2LendingPool: emptyContractDesc('aaveV2LendingPool'),
  aaveLikeRewardsProxyActions: contractDesc(
    aaveLikeRewardsProxyActions,
    base.mpa.core.AaveRewardsProxyActions,
  ),
  operationExecutor: contractDesc(operationExecutor, base.mpa.core.OperationExecutor),
  swapAddress: base.mpa.core.Swap,
  accountFactory: contractDesc(accountFactory, base.mpa.core.AccountFactory),
  accountGuard: contractDesc(accountGuard, base.mpa.core.AccountGuard),
  aaveV3Pool: contractDesc(aaveV3Pool, base.aave.v3.LendingPool),
  aaveV3Oracle: contractDesc(aaveV3Oracle, base.aave.v3.Oracle),
  aaveV3PoolDataProvider: contractDesc(aaveV3PoolDataProvider, base.aave.v3.PoolDataProvider),
  ajnaPoolInfo: contractDesc(ajnaPoolInfo, base.ajna.AjnaPoolInfo),
  ajnaProxyActions: contractDesc(ajnaProxyActions, base.ajna.AjnaProxyActions),
  ajnaPoolPairs: {
    'CBETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_CBETHETH),
    'CBETH-GHO': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_CBETHGHO),
    'ETH-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_ETHDAI),
    'ETH-GHO': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_ETHGHO),
    'ETH-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_ETHUSDC),
    'GHO-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_GHODAI),
    'RETH-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_RETHDAI),
    'RETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_RETHETH),
    'CBETH-USDBC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_CBETHUSDBC),
    'RETH-GHO': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_RETHGHO),
    'RETH-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_RETHUSDC),
    'SDAI-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_SDAIUSDC),
    'TBTC-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_TBTCUSDC),
    'TBTC-WBTC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_TBTCWBTC),
    'USDC-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_USDCETH),
    'USDC-WBTC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_USDCWBTC),
    'USDC-WLD': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_USDCWLD),
    'WBTC-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WBTCDAI),
    'WBTC-GHO': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WBTCGHO),
    'WBTC-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WBTCUSDC),
    'WLD-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WLDUSDC),
    'WSTETH-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WSTETHDAI),
    'WSTETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WSTETHETH),
    'WSTETH-GHO': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WSTETHGHO),
    'WSTETH-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WSTETHUSDC),
    'YFI-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_YFIDAI),
    'STYETH-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_STYETHDAI),
    'RBN-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_RBNETH),
    'AJNA-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_AJNADAI),
    'MKR-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_MKRDAI),
    'ARB-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_ARBETH),
    'ARB-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_ARBUSDC),
    'OP-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_OPETH),
    'OP-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_OPUSDC),
    'MEVETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_MEVETHWETH),
    'XETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_XETHWETH),
    'DETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_DETHWETH),
    'UNIETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_UNIETHWETH),
    'EZETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_EZETHWETH),
    'SUSDE-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_SUSDEDAI),
    'DEGEN-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_DEGENUSDC),
    'USDC-DEGEN': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_USDCDEGEN),
    'SNX-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_SNXUSDC),
    'ENA-SDAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_ENASDAI),
    'SDAI-ENA': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_SDAIENA),
    'AERO-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_AEROUSDC),
    'PRIME-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_PRIMEUSDC),
    'SAFE-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_SAFEDAI),
    'WOETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_WOETHETH),
    'SYRUPUSDC-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_SYRUPUSDCUSDC),
  },
  ajnaOraclessPoolPairs: {
    'YVCURVEUSDMSDAIF-DAI': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_YVCURVEUSDMSDAIFDAI),
    'MWSTETHWPUNKS20-WSTETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_MWSTETHWPUNKS20WSTETH),
    'MWSTETHWPUNKS40-WSTETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_MWSTETHWPUNKS40WSTETH),
    'APXETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_APXETHETH),
    'MPETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_MPETHWETH),
    'CSETH-ETH': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_CSETHWETH),
    'UNIV2-DAI': contractDesc(ajnaPool, base.ajna['AjnaPoolPairs_UNI-V2DAI']),
    'MOOAURAGYROAUSDCN/AUSDTNU-USDC': contractDesc(
      ajnaPool,
      base.ajna['AjnaPoolPairs_MOOAURAGYROAUSDCN/AUSDTNUSDC'],
    ),
    'SUSDCY-USDC': contractDesc(ajnaPool, base.ajna.AjnaPoolPairs_SUSDCYUSDC),
  },
  sky: {
    daiusds: emptyContractDesc('daiusds'),
    mkrsky: emptyContractDesc('mkrsky'),
    susds: emptyContractDesc('susds'),
    staking: emptyContractDesc('staking'),
    stakingCle: emptyContractDesc('stakingCle'),
  },
  ajnaERC20PoolFactory: contractDesc(ajnaERC20PoolFactory, base.ajna.ERC20PoolFactory),
  ajnaRedeemer: contractDesc(ajnaReedemer, base.ajna.AjnaRewardsReedemer),
  ajnaBonusRedeemer: contractDesc(ajnaBonusRedeemer, base.ajna.AjnaBonusRewardsReedemer),
  morphoBlue: contractDesc(morphoBlue, base.morphoblue.MorphoBlue),
  adaptiveCurveIrm: contractDesc(morphoBlue, base.morphoblue.AdaptiveCurveIrm),
  balancerVault: contractDesc(balancerVault, base.common.BalancerVault),
  // NOT contracts
  safeConfirmations: 6,
  openVaultSafeConfirmations: 6,
  taxProxyRegistries: [],
  etherscan: {
    url: 'https://basescan.org',
    apiUrl: 'https://api.basescan.org/api',
    apiKey: etherscanAPIKey || '',
    name: 'Basescan',
  },
  magicLink: {
    apiKey: '',
  },
  SdaiOracle: contractDesc(ajnaPoolInfo, base.common.SdaiOracle),
  WSTETHOracle: contractDesc(ajnaPoolInfo, base.common.WSTETHOracle),
  SUSDEOracle: contractDesc(ajnaPoolInfo, base.common.SUSDEOracle),
  USDEOracle: contractDesc(ajnaPoolInfo, base.common.USDEOracle),
  erc20ProxyActions: contractDesc(erc20proxyActions, base.mpa.core.ERC20ProxyActions),
}
