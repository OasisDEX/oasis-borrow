import { createSend, SendFunction } from '@oasisdex/transactions'
import * as Sentry from '@sentry/react'
import { trackingEvents } from 'analytics/analytics'
import { mixpanelIdentify } from 'analytics/mixpanel'
import { BigNumber } from 'bignumber.js'
import { CreateDPMAccount } from 'blockchain/calls/accountFactory'
import { ClaimAjnaRewardsTxData } from 'blockchain/calls/ajnaRewardsClaimer'
import {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import {
  call,
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas,
  EstimateGasFunction,
  SendTransactionFunction,
  TransactionDef,
} from 'blockchain/calls/callsHelpers'
import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from 'blockchain/calls/cdpManager'
import { cdpRegistryCdps, cdpRegistryOwns } from 'blockchain/calls/cdpRegistry'
import { charterNib, charterPeace, charterUline, charterUrnProxy } from 'blockchain/calls/charter'
import {
  cropperBonusTokenAddress,
  cropperCrops,
  cropperShare,
  cropperStake,
  cropperStock,
  cropperUrnProxy,
} from 'blockchain/calls/cropper'
import { dogIlk } from 'blockchain/calls/dog'
import {
  ApproveData,
  DisapproveData,
  tokenAllowance,
  tokenBalance,
  tokenBalanceFromAddress,
  tokenBalanceRawForJoin,
  tokenDecimals,
  tokenName,
  tokenSymbol,
} from 'blockchain/calls/erc20'
import { getCdps } from 'blockchain/calls/getCdps'
import { createIlkToToken$ } from 'blockchain/calls/ilkToToken'
import { jugIlk } from 'blockchain/calls/jug'
import { crvLdoRewardsEarned } from 'blockchain/calls/lidoCrvRewards'
import { ClaimMultipleData } from 'blockchain/calls/merkleRedeemer'
import { OasisActionsTxData } from 'blockchain/calls/oasisActions'
import { observe } from 'blockchain/calls/observe'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { pipHop, pipPeek, pipPeep, pipZzz } from 'blockchain/calls/osm'
import {
  CreateDsProxyData,
  createProxyAddress$,
  createProxyOwner$,
  SetProxyOwnerData,
} from 'blockchain/calls/proxy'
import { CropjoinProxyActionsContractAdapter } from 'blockchain/calls/proxyActions/adapters/CropjoinProxyActionsSmartContractAdapter'
import {
  ClaimRewardData,
  DepositAndGenerateData,
  OpenData,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import {
  CloseGuniMultiplyData,
  CloseVaultData,
  MultiplyAdjustData,
  OpenGuniMultiplyData,
  OpenMultiplyData,
  ReclaimData,
} from 'blockchain/calls/proxyActions/proxyActions'
import { proxyActionsAdapterResolver$ } from 'blockchain/calls/proxyActions/proxyActionsAdapterResolver'
import { vaultActionsLogic } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { spotIlk } from 'blockchain/calls/spot'
import { vatGem, vatIlk, vatUrns } from 'blockchain/calls/vat'
import { createVaultResolver$ } from 'blockchain/calls/vaultResolver'
import { getCollateralLocked$, getTotalValueLocked$ } from 'blockchain/collateral'
import { getNetworkContracts } from 'blockchain/contracts'
import { resolveENSName$ } from 'blockchain/ens'
import { createGetRegistryCdps$ } from 'blockchain/getRegistryCdps'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import { createIlkData$, createIlkDataList$, createIlksSupportedOnNetwork$ } from 'blockchain/ilks'
import { createInstiVault$, InstiVault } from 'blockchain/instiVault'
import {
  ContextConnected,
  createAccount$,
  createContext$,
  createContextConnected$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
  every10Seconds$,
} from 'blockchain/network'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import {
  createGasPrice$,
  createOraclePriceData$,
  createTokenPriceInUSD$,
  GasPriceParams,
  tokenPrices$,
} from 'blockchain/prices'
import {
  createAccountBalance$,
  createAllowance$,
  createBalance$,
  createBalanceFromAddress$,
  createCollateralTokens$,
} from 'blockchain/tokens'
import { charterIlks, cropJoinIlks } from 'blockchain/tokens/mainnet'
import {
  getPositionIdFromDpmProxy$,
  getUserDpmProxies$,
  getUserDpmProxy$,
  UserDpmAccount,
} from 'blockchain/userDpmProxies'
import {
  createStandardCdps$,
  createVault$,
  createVaults$,
  createVaultsFromIds$,
  decorateVaultsWithValue$,
  Vault,
} from 'blockchain/vaults'
import { pluginDevModeHelpers } from 'components/devModeHelpers'
import dayjs from 'dayjs'
import { getProxiesRelatedWithPosition$ } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import { getStrategyConfig$ } from 'features/aave/helpers/getStrategyConfig'
import { hasActiveAavePositionOnDsProxy$ } from 'features/aave/helpers/hasActiveAavePositionOnDsProxy$'
import {
  createProxyConsumed$,
  createReadPositionCreatedEvents$,
  getLastCreatedPositionForProxy$,
} from 'features/aave/services/readPositionCreatedEvents'
import { PositionId } from 'features/aave/types'
import { createAccountData } from 'features/account/AccountData'
import {
  getAjnaPosition$,
  getAjnaPositionsWithDetails$,
} from 'features/ajna/positions/common/observables/getAjnaPosition'
import {
  DpmPositionData,
  getDpmPositionData$,
  getDpmPositionDataV2$,
} from 'features/ajna/positions/common/observables/getDpmPositionData'
import { createAutomationTriggersData } from 'features/automation/api/automationTriggersData'
import {
  MULTIPLY_VAULT_PILL_CHANGE_SUBJECT,
  MultiplyPillChange,
} from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange'
import { createBonusPipe$ } from 'features/bonus/bonusPipe'
import { createMakerProtocolBonusAdapter } from 'features/bonus/makerProtocolBonusAdapter'
import {
  InstitutionalBorrowManageAdapter,
  ManageInstiVaultState,
} from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter'
import { StandardBorrowManageAdapter } from 'features/borrow/manage/pipes/adapters/standardBorrowManageAdapter'
import {
  createManageVault$,
  ManageStandardBorrowVaultState,
} from 'features/borrow/manage/pipes/manageVault'
import { createOpenVault$ } from 'features/borrow/open/pipes/openVault'
import { currentContent } from 'features/content'
import { createDaiDeposit$ } from 'features/dsr/helpers/daiDeposit'
import { createDsrDeposit$ } from 'features/dsr/helpers/dsrDeposit'
import { createDsrHistory$ } from 'features/dsr/helpers/dsrHistory'
import { chi, dsr, Pie, pie, SavingDaiData } from 'features/dsr/helpers/potCalls'
import { createDsr$ } from 'features/dsr/utils/createDsr'
import { createProxyAddress$ as createDsrProxyAddress$ } from 'features/dsr/utils/proxy'
import {
  getTotalSupply,
  getUnderlyingBalances,
} from 'features/earn/guni/manage/pipes/guniActionsCalls'
import { createManageGuniVault$ } from 'features/earn/guni/manage/pipes/manageGuniVault'
import { getGuniMintAmount, getToken1Balance } from 'features/earn/guni/open/pipes/guniActionsCalls'
import { createOpenGuniVault$ } from 'features/earn/guni/open/pipes/openGuniVault'
import {
  createMakerOracleTokenPrices$,
  createMakerOracleTokenPricesForDates$,
} from 'features/earn/makerOracleTokenPrices'
import { createExchangeQuote$, ExchangeAction, ExchangeType } from 'features/exchange/exchange'
import { followedVaults$ } from 'features/follow/api'
import { createGeneralManageVault$ } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import { getOasisStats$ } from 'features/homepage/stats'
import { createIlkDataListWithBalances$ } from 'features/ilks/ilksWithBalances'
import { createManageMultiplyVault$ } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createOpenMultiplyVault$ } from 'features/multiply/open/pipes/openMultiplyVault'
import { createVaultsNotices$ } from 'features/notices/vaultsNotices'
import { createReclaimCollateral$ } from 'features/reclaimCollateral/reclaimCollateral'
import { checkReferralLocalStorage$ } from 'features/referralOverview/referralLocal'
import { createUserReferral$ } from 'features/referralOverview/user'
import {
  getReferralsFromApi$,
  getUserFromApi$,
  getWeeklyClaimsFromApi$,
} from 'features/referralOverview/userApi'
import {
  BalanceInfo,
  createBalanceInfo$,
  createBalancesArrayInfo$,
  createBalancesFromAddressArrayInfo$,
} from 'features/shared/balanceInfo'
import { createCheckOasisCDPType$ } from 'features/shared/checkOasisCDPType'
import { jwtAuthSetupToken$ } from 'features/shared/jwt'
import { createPriceInfo$ } from 'features/shared/priceInfo'
import { checkVaultTypeUsingApi$, saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { getAllowanceStateMachine } from 'features/stateMachines/allowance'
import {
  getCreateDPMAccountTransactionMachine,
  getDPMAccountStateMachine,
} from 'features/stateMachines/dpmAccount'
import { getGasEstimation$ } from 'features/stateMachines/proxy/pipelines'
import { transactionContextService } from 'features/stateMachines/transaction'
import { createTermsAcceptance$ } from 'features/termsOfService/termsAcceptance'
import {
  checkAcceptanceFromApi$,
  saveAcceptanceFromApi$,
} from 'features/termsOfService/termsAcceptanceApi'
import { createUserSettings$ } from 'features/userSettings/userSettings'
import {
  checkUserSettingsLocalStorage$,
  saveUserSettingsLocalStorage$,
} from 'features/userSettings/userSettingsLocal'
import { createVaultHistory$ } from 'features/vaultHistory/vaultHistory'
import { vaultsWithHistory$ } from 'features/vaultHistory/vaultsHistory'
import { createAssetActions$ } from 'features/vaultsOverview/pipes/assetActions'
import {
  createAaveDpmPosition$,
  createAavePosition$,
  createMakerPositions$,
  createPositions$,
} from 'features/vaultsOverview/pipes/positions'
import { createMakerPositionsList$ } from 'features/vaultsOverview/pipes/positionsList'
import { createPositionsOverviewSummary$ } from 'features/vaultsOverview/pipes/positionsOverviewSummary'
import { createPositionsList$ } from 'features/vaultsOverview/vaultsOverview'
import { createWalletAssociatedRisk$ } from 'features/walletAssociatedRisk/walletRisk'
import { createWeb3Context$ } from 'features/web3Context'
import { getYieldChange$, getYields$ } from 'helpers/earn/calculations'
import { doGasEstimation, HasGasEstimation } from 'helpers/form'
import { getGasMultiplier } from 'helpers/getGasMultiplier'
import { supportedBorrowIlks, supportedEarnIlks, supportedMultiplyIlks } from 'helpers/productCards'
import { uiChanges } from 'helpers/uiChanges'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveV2Services } from 'lendingProtocols/aave-v2'
import { getAaveV3Services } from 'lendingProtocols/aave-v3'
import { AaveServices } from 'lendingProtocols/aaveCommon/AaveServices'
import { isEqual, memoize } from 'lodash'
import { equals } from 'ramda'
import { combineLatest, defer, Observable, of } from 'rxjs'
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  mergeMap,
  shareReplay,
  switchMap,
} from 'rxjs/operators'

import curry from 'ramda/src/curry'

export type TxData =
  | OpenData
  | DepositAndGenerateData
  | WithdrawAndPaybackData
  | ApproveData
  | DisapproveData
  | CreateDsProxyData
  | SetProxyOwnerData
  | ReclaimData
  | OpenMultiplyData
  | MultiplyAdjustData
  | CloseVaultData
  | OpenGuniMultiplyData
  | AutomationBotAddTriggerData
  | AutomationBotV2AddTriggerData
  | CloseGuniMultiplyData
  | ClaimRewardData
  | ClaimMultipleData
  | AutomationBotAddAggregatorTriggerData
  | AutomationBotRemoveTriggersData
  | AutomationBotV2RemoveTriggerData
  | OperationExecutorTxMeta
  | CreateDPMAccount
  | OasisActionsTxData
  | ClaimAjnaRewardsTxData
  | SavingDaiData

export type AutomationTxData =
  | AutomationBotAddTriggerData
  | AutomationBotV2AddTriggerData
  | AutomationBotAddAggregatorTriggerData
  | AutomationBotRemoveTriggersData
  | AutomationBotV2RemoveTriggerData

export interface TxHelpers {
  send: SendTransactionFunction<TxData>
  sendWithGasEstimation: SendTransactionFunction<TxData>
  estimateGas: EstimateGasFunction<TxData>
}

export const protoTxHelpers: TxHelpers = {
  send: () => null as any,
  sendWithGasEstimation: () => null as any,
  estimateGas: () => null as any,
}

export type AddGasEstimationFunction = <S extends HasGasEstimation>(
  state: S,
  call: (send: TxHelpers, state: S) => Observable<number> | undefined,
) => Observable<S>

export type TxHelpers$ = Observable<TxHelpers>

function createTxHelpers$(
  context$: Observable<ContextConnected>,
  send: SendFunction<TxData>,
  gasPrice$: Observable<GasPriceParams>,
): TxHelpers$ {
  return context$.pipe(
    filter(({ status }) => status === 'connected'),
    map((context) => ({
      send: createSendTransaction(send, context),
      sendWithGasEstimation: createSendWithGasConstraints(
        send,
        context,
        gasPrice$,
        getGasMultiplier(context),
      ),
      estimateGas: <B extends TxData>(def: TransactionDef<B>, args: B): Observable<number> => {
        return estimateGas(context, def, args, getGasMultiplier(context))
      },
    })),
  )
}

const refreshInterval = 1000 * 60

export function setupAppContext() {
  const once$ = of(undefined).pipe(shareReplay(1))
  const [web3Context$, setupWeb3Context$] = createWeb3Context$()

  const account$ = createAccount$(web3Context$)
  const initializedAccount$ = createInitializedAccount$(account$)

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$, everyBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$)

  const chainContext$ = context$.pipe(
    distinctUntilChanged(
      (previousContext, newContext) => previousContext.chainId === newContext.chainId,
    ),
    shareReplay(1),
  )

  const connectedContext$ = createContextConnected$(context$)

  combineLatest(account$, connectedContext$)
    .pipe(
      mergeMap(([account, network]) => {
        return of({
          networkName: network.name,
          connectionKind: network.connectionKind,
          account: account?.toLowerCase(),
          method: network.connectionMethod,
          walletLabel: network.walletLabel,
        })
      }),
      distinctUntilChanged(isEqual),
    )
    .subscribe(({ account, networkName, connectionKind, method, walletLabel }) => {
      if (account) {
        Sentry.setUser({ id: account, walletLabel: walletLabel })
        mixpanelIdentify(account, { walletType: connectionKind, walletLabel: walletLabel })
        trackingEvents.accountChange(account, networkName, connectionKind, method, walletLabel)
      }
    })

  const oracleContext$ = context$.pipe(
    switchMap((ctx) =>
      of({ ...ctx, account: getNetworkContracts(NetworkIds.MAINNET, ctx.chainId).mcdSpot.address }),
    ),
    shareReplay(1),
  ) as Observable<ContextConnected>

  const [send] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    // @ts-ignore
    connectedContext$,
  )

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$)

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)

  const tokenPriceUSD$ = memoize(
    curry(createTokenPriceInUSD$)(every10Seconds$, tokenPrices$),
    (tokens: string[]) => tokens.sort().join(','),
  )
  const tokenPriceUSDStatic$ = memoize(
    curry(createTokenPriceInUSD$)(once$, tokenPrices$),
    (tokens: string[]) => tokens.sort().join(','),
  )

  const daiEthTokenPrice$ = tokenPriceUSD$(['DAI', 'ETH'])

  function addGasEstimation$<S extends HasGasEstimation>(
    state: S,
    call: (send: TxHelpers, state: S) => Observable<number> | undefined,
  ): Observable<S> {
    return doGasEstimation(gasPrice$, daiEthTokenPrice$, txHelpers$, state, call)
  }

  // protocols
  const aaveV2 = getAaveV2Services({
    refresh$: onEveryBlock$,
  })

  const aaveV3 = getAaveV3Services({ refresh$: onEveryBlock$, networkId: NetworkIds.MAINNET })
  const aaveV3Optimism = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.OPTIMISMMAINNET,
  })
  const aaveV3Arbitrum = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.ARBITRUMMAINNET,
  })

  // base
  const proxyAddress$ = memoize(curry(createProxyAddress$)(onEveryBlock$, context$))
  const proxyOwner$ = memoize(curry(createProxyOwner$)(onEveryBlock$, context$))
  const cdpManagerUrns$ = observe(onEveryBlock$, context$, cdpManagerUrns, bigNumberTostring)
  const cdpManagerIlks$ = observe(onEveryBlock$, context$, cdpManagerIlks, bigNumberTostring)
  const cdpManagerOwner$ = observe(onEveryBlock$, chainContext$, cdpManagerOwner, bigNumberTostring)
  const cdpRegistryOwns$ = observe(onEveryBlock$, chainContext$, cdpRegistryOwns)
  const cdpRegistryCdps$ = observe(onEveryBlock$, chainContext$, cdpRegistryCdps)
  const vatIlks$ = observe(onEveryBlock$, chainContext$, vatIlk)
  const vatIlksLean$ = observe(once$, chainContext$, vatIlk)
  const vatUrns$ = observe(onEveryBlock$, chainContext$, vatUrns, ilkUrnAddressToString)
  const vatGem$ = observe(onEveryBlock$, chainContext$, vatGem, ilkUrnAddressToString)
  const spotIlks$ = observe(onEveryBlock$, chainContext$, spotIlk)
  const spotIlksLean$ = observe(once$, chainContext$, spotIlk)
  const jugIlks$ = observe(onEveryBlock$, chainContext$, jugIlk)
  const jugIlksLean$ = observe(once$, chainContext$, jugIlk)
  const dogIlks$ = observe(onEveryBlock$, chainContext$, dogIlk)
  const dogIlksLean$ = observe(once$, chainContext$, dogIlk)

  const charterNib$ = observe(onEveryBlock$, context$, charterNib)
  const charterPeace$ = observe(onEveryBlock$, context$, charterPeace)
  const charterUline$ = observe(onEveryBlock$, context$, charterUline)
  const charterUrnProxy$ = observe(onEveryBlock$, context$, charterUrnProxy)

  const cropperUrnProxy$ = observe(onEveryBlock$, context$, cropperUrnProxy)
  const cropperStake$ = observe(onEveryBlock$, context$, cropperStake)
  const cropperShare$ = observe(onEveryBlock$, context$, cropperShare)
  const cropperStock$ = observe(onEveryBlock$, context$, cropperStock)
  const cropperTotal$ = observe(onEveryBlock$, context$, cropperStock)
  const cropperCrops$ = observe(onEveryBlock$, context$, cropperCrops)
  const cropperBonusTokenAddress$ = observe(onEveryBlock$, context$, cropperBonusTokenAddress)

  const pipZzz$ = observe(onEveryBlock$, chainContext$, pipZzz)
  const pipZzzLean$ = observe(once$, chainContext$, pipZzz)
  const pipHop$ = observe(onEveryBlock$, context$, pipHop)
  const pipHopLean$ = observe(once$, context$, pipHop)
  const pipPeek$ = observe(onEveryBlock$, oracleContext$, pipPeek)
  const pipPeekLean$ = observe(once$, oracleContext$, pipPeek)
  const pipPeep$ = observe(onEveryBlock$, oracleContext$, pipPeep)
  const pipPeepLean$ = observe(once$, oracleContext$, pipPeep)

  const unclaimedCrvLdoRewardsForIlk$ = observe(onEveryBlock$, context$, crvLdoRewardsEarned)

  const getCdps$ = observe(onEveryBlock$, context$, getCdps)

  const charter = {
    nib$: (args: { ilk: string; usr: string }) => charterNib$(args),
    peace$: (args: { ilk: string; usr: string }) => charterPeace$(args),
    uline$: (args: { ilk: string; usr: string }) => charterUline$(args),
  }

  const oraclePriceData$ = memoize(
    curry(createOraclePriceData$)(chainContext$, pipPeek$, pipPeep$, pipZzz$, pipHop$),
    ({ token, requestedData }) => {
      return `${token}-${requestedData.join(',')}`
    },
  )

  const oraclePriceDataLean$ = memoize(
    curry(createOraclePriceData$)(
      chainContext$,
      pipPeekLean$,
      pipPeepLean$,
      pipZzzLean$,
      pipHopLean$,
    ),
    ({ token, requestedData }) => {
      return `${token}-${requestedData.join(',')}`
    },
  )

  const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance)
  const tokenBalanceLean$ = observe(once$, context$, tokenBalance)
  const tokenBalanceFromAddress$ = observe(onEveryBlock$, context$, tokenBalanceFromAddress)

  const balance$ = memoize(
    curry(createBalance$)(onEveryBlock$, chainContext$, tokenBalance$),
    (token, address) => `${token}_${address}`,
  )

  const balanceLean$ = memoize(
    curry(createBalance$)(once$, chainContext$, tokenBalanceLean$),
    (token, address) => `${token}_${address}`,
  )

  const balanceFromAddress$ = memoize(
    curry(createBalanceFromAddress$)(tokenBalanceFromAddress$),
    (token, address) => `${token.address}_${token.precision}_${address}`,
  )

  const ensName$ = memoize(curry(resolveENSName$)(context$), (address) => address)

  const userDpmProxies$ = memoize(
    curry(getUserDpmProxies$)(context$),
    (walletAddress) => walletAddress,
  )

  const userDpmProxy$ = memoize(curry(getUserDpmProxy$)(context$), (vaultId) => vaultId)
  const positionIdFromDpmProxy$ = memoize(
    curry(getPositionIdFromDpmProxy$)(context$),
    (dpmProxy) => dpmProxy,
  )

  const tokenAllowance$ = observe(onEveryBlock$, context$, tokenAllowance)
  const tokenBalanceRawForJoin$ = observe(onEveryBlock$, chainContext$, tokenBalanceRawForJoin)
  const tokenDecimals$ = observe(onEveryBlock$, chainContext$, tokenDecimals)
  const tokenSymbol$ = observe(onEveryBlock$, chainContext$, tokenSymbol)
  const tokenName$ = observe(onEveryBlock$, chainContext$, tokenName)

  const allowance$ = curry(createAllowance$)(context$, tokenAllowance$)

  const ilkToToken$ = memoize(curry(createIlkToToken$)(chainContext$))

  const ilkData$ = memoize(
    curry(createIlkData$)(vatIlks$, spotIlks$, jugIlks$, dogIlks$, ilkToToken$),
  )

  const ilkDataLean$ = memoize(
    curry(createIlkData$)(vatIlksLean$, spotIlksLean$, jugIlksLean$, dogIlksLean$, ilkToToken$),
  )

  const charterCdps$ = memoize(
    curry(createGetRegistryCdps$)(
      onEveryBlock$,
      chainContext$,
      cdpRegistryCdps$,
      proxyAddress$,
      charterIlks,
    ),
  )
  const cropJoinCdps$ = memoize(
    curry(createGetRegistryCdps$)(
      onEveryBlock$,
      chainContext$,
      cdpRegistryCdps$,
      proxyAddress$,
      cropJoinIlks,
    ),
  )
  const standardCdps$ = memoize(curry(createStandardCdps$)(proxyAddress$, getCdps$))

  const urnResolver$ = curry(createVaultResolver$)(
    cdpManagerIlks$,
    cdpManagerUrns$,
    charterUrnProxy$,
    cropperUrnProxy$,
    cdpRegistryOwns$,
    cdpManagerOwner$,
    proxyOwner$,
  )

  const bonusAdapter = memoize(
    (cdpId: BigNumber) =>
      createMakerProtocolBonusAdapter(
        urnResolver$,
        unclaimedCrvLdoRewardsForIlk$,
        {
          stake$: cropperStake$,
          share$: cropperShare$,
          bonusTokenAddress$: cropperBonusTokenAddress$,
          stock$: cropperStock$,
          total$: cropperTotal$,
          crops$: cropperCrops$,
        },
        {
          tokenDecimals$,
          tokenSymbol$,
          tokenName$,
          tokenBalanceRawForJoin$,
        },
        connectedContext$,
        txHelpers$,
        vaultActionsLogic(new CropjoinProxyActionsContractAdapter()),
        proxyAddress$,
        cdpId,
      ),
    bigNumberTostring,
  )

  const bonus$ = memoize(
    (cdpId: BigNumber) => createBonusPipe$(bonusAdapter, cdpId),
    bigNumberTostring,
  )

  const potDsr$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, dsr)()))
    }),
  )
  const potChi$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, chi)()))
    }),
  )

  const potBigPie$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, Pie)()))
    }),
  )

  const potTotalValueLocked$ = combineLatest(potChi$, potBigPie$).pipe(
    switchMap(([chi, potBigPie]) =>
      of(potBigPie.div(new BigNumber(10).pow(18)).times(chi.div(new BigNumber(10).pow(27)))),
    ),
    shareReplay(1),
  )

  const proxyAddressDsrObservable$ = memoize(
    (addressFromUrl: string) =>
      context$.pipe(
        switchMap((context) => everyBlock$(createDsrProxyAddress$(context, addressFromUrl))),
        shareReplay(1),
      ),
    (item) => item,
  )

  const dsrHistory$ = memoize(
    (addressFromUrl: string) =>
      combineLatest(context$, proxyAddressDsrObservable$(addressFromUrl), onEveryBlock$).pipe(
        switchMap(([context, proxyAddress, _]) => {
          return proxyAddress ? defer(() => createDsrHistory$(context, proxyAddress)) : of([])
        }),
      ),
    (item) => item,
  )

  // TODO: Lines 737 to 773, think we are needing to modify this to use different context, lots of repeated code
  const dsr$ = memoize(
    (addressFromUrl: string) =>
      createDsr$(
        context$,
        everyBlock$,
        onEveryBlock$,
        dsrHistory$(addressFromUrl),
        potDsr$,
        potChi$,
        addressFromUrl,
      ),
    (item) => item,
  )

  const potPie$ = memoize(
    (addressFromUrl: string) =>
      combineLatest(context$, proxyAddressDsrObservable$(addressFromUrl)).pipe(
        switchMap(([context, proxyAddress]) => {
          if (!proxyAddress) return of(zero)
          return everyBlock$(
            defer(() => call(context, pie)(proxyAddress!)),
            equals,
          )
        }),
      ),
    (item) => item,
  )

  const daiDeposit$ = memoize(
    (addressFromUrl: string) => createDaiDeposit$(potPie$(addressFromUrl), potChi$),
    (item) => item,
  )

  const dsrDeposit$ = memoize(
    (addressFromUrl: string) =>
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddressDsrObservable$(addressFromUrl),
        allowance$,
        balancesInfoArray$(['DAI', 'SDAI'], addressFromUrl),
        daiDeposit$(addressFromUrl),
        potDsr$,
        dsr$(addressFromUrl),
        addGasEstimation$,
      ),
    (item) => item,
  )

  const vault$ = memoize(
    (id: BigNumber) =>
      createVault$(
        urnResolver$,
        vatUrns$,
        vatGem$,
        ilkData$,
        oraclePriceData$,
        ilkToToken$,
        chainContext$,
        id,
      ),
    bigNumberTostring,
  )

  const instiVault$ = memoize(
    curry(createInstiVault$)(
      urnResolver$,
      vatUrns$,
      vatGem$,
      ilkData$,
      oraclePriceData$,
      ilkToToken$,
      context$,
      charter,
    ),
  )

  const vaultHistory$ = memoize(curry(createVaultHistory$)(chainContext$, onEveryBlock$, vault$))

  pluginDevModeHelpers(txHelpers$, connectedContext$, proxyAddress$)

  const vaults$ = memoize(
    curry(createVaults$)(onEveryBlock$, vault$, chainContext$, [
      charterCdps$,
      cropJoinCdps$,
      standardCdps$,
    ]),
  )

  const ilksSupportedOnNetwork$ = createIlksSupportedOnNetwork$(chainContext$)

  const collateralTokens$ = createCollateralTokens$(ilksSupportedOnNetwork$, ilkToToken$)

  const accountBalances$ = curry(createAccountBalance$)(
    balanceLean$,
    collateralTokens$,
    oraclePriceDataLean$,
  )

  const ilkDataList$ = createIlkDataList$(ilkDataLean$, ilksSupportedOnNetwork$)
  const ilksWithBalance$ = createIlkDataListWithBalances$(context$, ilkDataList$, accountBalances$)

  const priceInfo$ = curry(createPriceInfo$)(oraclePriceData$)

  // TODO Don't allow undefined args like this
  const balanceInfo$ = curry(createBalanceInfo$)(balance$) as (
    token: string,
    account: string | undefined,
  ) => Observable<BalanceInfo>

  const balancesInfoArray$ = curry(createBalancesArrayInfo$)(balance$)
  const balancesFromAddressInfoArray$ = curry(createBalancesFromAddressArrayInfo$)(
    balanceFromAddress$,
  )

  const userSettings$ = createUserSettings$(
    checkUserSettingsLocalStorage$,
    saveUserSettingsLocalStorage$,
  )

  const openVault$ = memoize((ilk: string) =>
    createOpenVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      ilkToToken$,
      addGasEstimation$,
      proxyActionsAdapterResolver$,
      ilk,
    ),
  )

  const exchangeQuote$ = memoize(
    (
      token: string,
      slippage: BigNumber,
      amount: BigNumber,
      action: ExchangeAction,
      exchangeType: ExchangeType,
      quoteToken?: string,
    ) =>
      createExchangeQuote$(
        context$,
        undefined,
        token,
        slippage,
        amount,
        action,
        exchangeType,
        quoteToken,
      ),
    (token: string, slippage: BigNumber, amount: BigNumber, action: string, exchangeType: string) =>
      `${token}_${slippage.toString()}_${amount.toString()}_${action}_${exchangeType}`,
  )

  const vaultWithValue$ = memoize(
    curry(decorateVaultsWithValue$)(vaults$, exchangeQuote$, userSettings$),
  )

  const proxyConsumed$ = memoize(curry(createProxyConsumed$)(context$))

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$, userDpmProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const readPositionCreatedEvents$ = memoize(
    curry(createReadPositionCreatedEvents$)(context$, userDpmProxies$),
  )

  const lastCreatedPositionForProxy$ = memoize(curry(getLastCreatedPositionForProxy$)(context$))

  const strategyConfig$ = memoize(
    curry(getStrategyConfig$)(
      proxiesRelatedWithPosition$,
      aaveV2.aaveProxyConfiguration$,
      lastCreatedPositionForProxy$,
    ),
    (positionId: PositionId, networkName: NetworkNames) =>
      `${positionId.walletAddress}-${positionId.vaultId}-${networkName}`,
  )

  const automationTriggersData$ = memoize(
    curry(createAutomationTriggersData)(chainContext$, onEveryBlock$, proxiesRelatedWithPosition$),
  )

  const mainnetDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]> = memoize(
    curry(getUserDpmProxies$)(of({ chainId: NetworkIds.MAINNET })),
    (walletAddress) => walletAddress,
  )

  const mainnetReadPositionCreatedEvents$ = memoize(
    curry(createReadPositionCreatedEvents$)(
      of({ chainId: NetworkIds.MAINNET }),
      mainnetDpmProxies$,
    ),
  )

  const mainnetAavePositions$ = memoize(
    curry(createAavePosition$)(
      {
        dsProxy$: proxyAddress$,
        userDpmProxies$: mainnetDpmProxies$,
      },
      {
        tickerPrices$: tokenPriceUSDStatic$,
        context$,
        automationTriggersData$,
        readPositionCreatedEvents$: mainnetReadPositionCreatedEvents$,
      },
      aaveV2,
      aaveV3,
    ),
  )

  const optimismDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]> = memoize(
    curry(getUserDpmProxies$)(of({ chainId: NetworkIds.OPTIMISMMAINNET })),
    (walletAddress) => walletAddress,
  )

  const optimismReadPositionCreatedEvents$ = memoize(
    curry(createReadPositionCreatedEvents$)(
      of({ chainId: NetworkIds.OPTIMISMMAINNET }),
      optimismDpmProxies$,
    ),
  )

  const aaveOptimismPositions$ = memoize(
    curry(createAaveDpmPosition$)(
      context$,
      optimismDpmProxies$,
      tokenPriceUSDStatic$,
      optimismReadPositionCreatedEvents$,
      aaveV3Optimism,
      NetworkIds.OPTIMISMMAINNET,
    ),
    (wallet) => wallet,
  )

  const aavePositions$ = memoize((walletAddress: string) => {
    return combineLatest([
      mainnetAavePositions$(walletAddress),
      aaveOptimismPositions$(walletAddress),
    ]).pipe(
      map(([mainnetAavePositions, optimismAavePositions]) => {
        return [...mainnetAavePositions, ...optimismAavePositions]
      }),
    )
  })

  const makerPositions$ = memoize(curry(createMakerPositions$)(vaultWithValue$))
  const positions$ = memoize(
    curry(createPositions$)(makerPositions$, mainnetAavePositions$, aaveOptimismPositions$),
  )

  const openMultiplyVault$ = memoize((ilk: string) =>
    createOpenMultiplyVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      exchangeQuote$,
      addGasEstimation$,
      userSettings$,
      ilk,
    ),
  )

  const token1Balance$ = observe(onEveryBlock$, context$, getToken1Balance)
  const getGuniMintAmount$ = observe(onEveryBlock$, context$, getGuniMintAmount)

  const manageVault$ = memoize(
    (id: BigNumber) =>
      createManageVault$<Vault, ManageStandardBorrowVaultState>(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        saveVaultUsingApi$,
        addGasEstimation$,
        vaultHistory$,
        proxyActionsAdapterResolver$,
        StandardBorrowManageAdapter,
        automationTriggersData$,
        id,
      ),
    bigNumberTostring,
  )

  const manageInstiVault$ = memoize(
    (id: BigNumber) =>
      createManageVault$<InstiVault, ManageInstiVaultState>(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        instiVault$,
        saveVaultUsingApi$,
        addGasEstimation$,
        vaultHistory$,
        proxyActionsAdapterResolver$,
        InstitutionalBorrowManageAdapter,
        automationTriggersData$,
        id,
      ),
    bigNumberTostring,
  )

  const manageMultiplyVault$ = memoize(
    (id: BigNumber) =>
      createManageMultiplyVault$(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        exchangeQuote$,
        addGasEstimation$,
        userSettings$,
        vaultHistory$,
        saveVaultUsingApi$,
        automationTriggersData$,
        id,
      ),
    bigNumberTostring,
  )

  const getGuniPoolBalances$ = observe(onEveryBlock$, context$, getUnderlyingBalances)

  const getTotalSupply$ = observe(onEveryBlock$, context$, getTotalSupply)

  function getProportions$(gUniBalance: BigNumber, token: string) {
    return combineLatest(getGuniPoolBalances$({ token }), getTotalSupply$({ token })).pipe(
      map(([{ amount0, amount1 }, totalSupply]) => {
        return {
          sharedAmount0: amount0.times(gUniBalance).div(totalSupply),
          sharedAmount1: amount1.times(gUniBalance).div(totalSupply),
        }
      }),
    )
  }

  const manageGuniVault$ = memoize(
    (id: BigNumber) =>
      createManageGuniVault$(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        exchangeQuote$,
        addGasEstimation$,
        getProportions$,
        vaultHistory$,
        makerOracleTokenPrices$,
        id,
      ),
    bigNumberTostring,
  )

  const checkOasisCDPType$: ({
    id,
    protocol,
  }: {
    id: BigNumber
    protocol: string
  }) => Observable<VaultType> = curry(createCheckOasisCDPType$)(
    curry(checkVaultTypeUsingApi$)(
      context$,
      uiChanges.subscribe<MultiplyPillChange>(MULTIPLY_VAULT_PILL_CHANGE_SUBJECT),
    ),
    cdpManagerIlks$,
    charterIlks,
  )

  const generalManageVault$ = memoize(
    curry(createGeneralManageVault$)(
      manageInstiVault$,
      manageMultiplyVault$,
      manageGuniVault$,
      manageVault$,
      checkOasisCDPType$,
      vault$,
    ),
    bigNumberTostring,
  )

  const vaultsHistoryAndValue$ = memoize(
    curry(vaultsWithHistory$)(chainContext$, vaultWithValue$, refreshInterval),
  )

  const positionsList$ = memoize(
    curry(createMakerPositionsList$)(context$, ilksWithBalance$, vaultsHistoryAndValue$),
  )

  const assetActions$ = memoize(
    curry(createAssetActions$)(
      context$,
      ilkToToken$,
      {
        borrow: supportedBorrowIlks,
        multiply: supportedMultiplyIlks,
        earn: supportedEarnIlks,
      },
      uiChanges,
    ),
  )

  const positionsOverviewSummary$ = memoize(
    curry(createPositionsOverviewSummary$)(balanceLean$, tokenPriceUSD$, positions$, assetActions$),
  )

  const termsAcceptance$ = createTermsAcceptance$(
    web3Context$,
    currentContent.tos.version,
    jwtAuthSetupToken$,
    checkAcceptanceFromApi$,
    saveAcceptanceFromApi$,
  )

  const walletAssociatedRisk$ = createWalletAssociatedRisk$(web3Context$, termsAcceptance$)

  const userReferral$ = createUserReferral$(
    web3Context$,
    txHelpers$,
    getUserFromApi$,
    getReferralsFromApi$,
    getWeeklyClaimsFromApi$,
    checkReferralLocalStorage$,
  )

  const checkReferralLocal$ = checkReferralLocalStorage$()

  const vaultBanners$ = memoize(
    curry(createVaultsNotices$)(context$, priceInfo$, vault$, vaultHistory$),
    bigNumberTostring,
  )

  const reclaimCollateral$ = memoize(
    curry(createReclaimCollateral$)(context$, txHelpers$, proxyAddress$),
    bigNumberTostring,
  )
  const hasActiveDsProxyAavePosition$ = hasActiveAavePositionOnDsProxy$(
    connectedContext$,
    proxyAddress$,
    proxyConsumed$,
  )

  // Here we're aggregating events from all networks to show all open positions
  // Should add new networks here in the future to count all positions
  const allNetworkReadPositionCreatedEvents$ = (wallet: string) =>
    combineLatest([
      mainnetReadPositionCreatedEvents$(wallet),
      optimismReadPositionCreatedEvents$(wallet),
    ]).pipe(
      map(([mainnetEvents, optimismEvents]) => {
        return [...mainnetEvents, ...optimismEvents]
      }),
    )

  const accountData$ = createAccountData(
    web3Context$,
    balance$,
    vaults$,
    hasActiveDsProxyAavePosition$,
    allNetworkReadPositionCreatedEvents$,
    ensName$,
  )

  const makerOracleTokenPrices$ = memoize(
    curry(createMakerOracleTokenPrices$)(chainContext$),
    (token: string, timestamp: dayjs.Dayjs) => {
      return `${token}-${timestamp.format('YYYY-MM-DD HH:mm')}`
    },
  )

  const makerOracleTokenPricesForDates$ = memoize(
    curry(createMakerOracleTokenPricesForDates$)(chainContext$),
    (token: string, timestamps: dayjs.Dayjs[]) => {
      return `${token}-${timestamps.map((t) => t.format('YYYY-MM-DD HH:mm')).join(' ')}`
    },
  )

  const yields$ = memoize(
    (ilk: string, date?: dayjs.Dayjs) => {
      return getYields$(makerOracleTokenPricesForDates$, ilkData$, ilk, date)
    },
    (ilk: string, date: dayjs.Dayjs = dayjs()) => `${ilk}-${date.format('YYYY-MM-DD')}`,
  )

  const yieldsChange$ = memoize(
    curry(getYieldChange$)(yields$),
    (currentDate: dayjs.Dayjs, previousDate: dayjs.Dayjs, ilk: string) =>
      `${ilk}_${currentDate.format('YYYY-MM-DD')}_${previousDate.format('YYYY-MM-DD')}`,
  )

  const collateralLocked$ = memoize(
    curry(getCollateralLocked$)(connectedContext$, ilkToToken$, balance$),
  )

  const totalValueLocked$ = memoize(
    curry(getTotalValueLocked$)(collateralLocked$, oraclePriceData$),
  )

  const openGuniVault$ = memoize((ilk: string) =>
    createOpenGuniVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      exchangeQuote$,
      onEveryBlock$,
      addGasEstimation$,
      ilk,
      token1Balance$,
      getGuniMintAmount$,
      userSettings$,
    ),
  )

  const vaultsFromId$ = memoize(
    curry(createVaultsFromIds$)(onEveryBlock$, followedVaults$, vault$, chainContext$, [
      charterCdps$,
      cropJoinCdps$,
      standardCdps$,
    ]),
  )

  const ajnaPositions$ = memoize(
    curry(getAjnaPositionsWithDetails$)(
      context$,
      userDpmProxies$,
      readPositionCreatedEvents$,
      tokenPriceUSDStatic$,
    ),
    (walletAddress: string) => walletAddress,
  )

  const ownersPositionsList$ = memoize(
    curry(createPositionsList$)(positionsList$, aavePositions$, ajnaPositions$, dsr$),
  )

  const followedList$ = memoize(
    curry(createMakerPositionsList$)(
      context$,
      ilksWithBalance$,
      memoize(
        curry(vaultsWithHistory$)(
          chainContext$,
          curry(decorateVaultsWithValue$)(vaultsFromId$, exchangeQuote$, userSettings$),
          refreshInterval,
        ),
      ),
    ),
  )

  const protocols: ProtocolsServices = {
    [LendingProtocol.AaveV2]: aaveV2,
    [LendingProtocol.AaveV3]: {
      [NetworkIds.MAINNET]: aaveV3,
      [NetworkIds.OPTIMISMMAINNET]: aaveV3Optimism,
      [NetworkIds.ARBITRUMMAINNET]: aaveV3Arbitrum,
    },
  }

  const contextForAddress$ = connectedContext$.pipe(
    distinctUntilKeyChanged('account'),
    shareReplay(1),
  )

  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)

  const commonTransactionServices = transactionContextService(context$)

  const dpmAccountTransactionMachine = getCreateDPMAccountTransactionMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const dpmAccountStateMachine = getDPMAccountStateMachine(
    context$,
    txHelpers$,
    gasEstimation$,
    dpmAccountTransactionMachine,
  )

  const allowanceStateMachine = getAllowanceStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const allowanceForAccount$: (token: string, spender: string) => Observable<BigNumber> = memoize(
    (token: string, spender: string) =>
      contextForAddress$.pipe(switchMap(({ account }) => allowance$(token, account, spender))),
    (token, spender) => `${token}-${spender}`,
  )

  const dpmPositionData$ = memoize(
    curry(getDpmPositionData$)(proxiesRelatedWithPosition$, lastCreatedPositionForProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  // v2 because it takes into account all positions created using specific proxies and filter them
  // out based on params from URL i.e. 2x positions with id 950 but on different pools, based on URL params
  // only single position should be picked to be displayed
  const dpmPositionDataV2$ = memoize(
    curry(getDpmPositionDataV2$)(proxiesRelatedWithPosition$, readPositionCreatedEvents$),
    (positionId: PositionId, collateralToken?: string, quoteToken?: string, product?: string) =>
      `${positionId.walletAddress}-${positionId.vaultId}-${collateralToken}-${quoteToken}-${product}`,
  )

  const ajnaPosition$ = memoize(
    curry(getAjnaPosition$)(context$, onEveryBlock$),
    (
      collateralPrice: BigNumber,
      quotePrice: BigNumber,
      dpmPositionData: DpmPositionData,
      collateralAddress?: string,
      quoteAddress?: string,
    ) =>
      `${dpmPositionData.vaultId}-${collateralPrice.decimalPlaces(2).toString()}-${quotePrice
        .decimalPlaces(2)
        .toString()}-${collateralAddress}-${quoteAddress}`,
  )

  const identifiedTokens$ = memoize(curry(identifyTokens$)(context$, once$), (tokens: string[]) =>
    tokens.join(),
  )

  return {
    web3Context$,
    web3ContextConnected$,
    setupWeb3Context$,
    context$,
    onEveryBlock$,
    txHelpers$,
    proxyAddress$,
    proxyOwner$,
    vaults$,
    vault$,
    ilks$: ilksSupportedOnNetwork$,
    balance$,
    balancesInfoArray$,
    balancesFromAddressInfoArray$,
    accountBalances$,
    openVault$,
    manageVault$,
    manageInstiVault$,
    manageMultiplyVault$,
    manageGuniVault$,
    vaultBanners$,
    gasPrice$,
    automationTriggersData$,
    accountData$,
    vaultHistory$,
    termsAcceptance$,
    walletAssociatedRisk$,
    reclaimCollateral$,
    openMultiplyVault$,
    generalManageVault$,
    userSettings$,
    openGuniVault$,
    ilkDataList$,
    connectedContext$,
    getOasisStats$: memoize(getOasisStats$),
    addGasEstimation$,
    instiVault$,
    ilkToToken$,
    bonus$,
    positionsOverviewSummary$,
    priceInfo$,
    yields$,
    daiEthTokenPrice$,
    totalValueLocked$,
    yieldsChange$,
    tokenPriceUSD$,
    userReferral$,
    checkReferralLocal$,
    balanceInfo$,
    once$,
    allowance$,
    userDpmProxies$,
    userDpmProxy$,
    hasActiveDsProxyAavePosition$,
    aaveLiquidations$: aaveV2.aaveLiquidations$, // @deprecated,
    aaveUserAccountData$: aaveV2.aaveUserAccountData$,
    aaveAvailableLiquidityInUSDC$: aaveV2.aaveAvailableLiquidityInUSDC$,
    proxyConsumed$,
    dsr$,
    dsrDeposit$,
    potDsr$,
    potTotalValueLocked$,
    aaveProtocolData$: aaveV2.aaveProtocolData$,
    strategyConfig$,
    readPositionCreatedEvents$,
    ownersPositionsList$,
    followedList$,
    protocols,
    commonTransactionServices,
    gasEstimation$,
    dpmAccountStateMachine,
    allowanceStateMachine,
    allowanceForAccount$,
    contextForAddress$,
    dpmPositionData$,
    dpmPositionDataV2$,
    ajnaPosition$,
    identifiedTokens$,
    chainContext$,
    positionIdFromDpmProxy$,
    exchangeQuote$,
  }
}

export function bigNumberTostring(v: BigNumber): string {
  return v.toString()
}

function ilkUrnAddressToString({ ilk, urnAddress }: { ilk: string; urnAddress: string }): string {
  return `${ilk}-${urnAddress}`
}

export type ProtocolsServices = {
  [LendingProtocol.AaveV2]: AaveServices
  [LendingProtocol.AaveV3]: {
    [NetworkIds.MAINNET]: AaveServices
    [NetworkIds.OPTIMISMMAINNET]: AaveServices
    [NetworkIds.ARBITRUMMAINNET]: AaveServices
  }
}

export type DepreciatedServices = {
  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveLiquidations$ instead
   */
  aaveLiquidations$: ReturnType<typeof getAaveV2Services>['aaveLiquidations$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveUserAccountData$ instead
   */
  aaveUserAccountData$: ReturnType<typeof getAaveV2Services>['aaveUserAccountData$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveAvailableLiquidityInUSDC$ instead
   */
  aaveAvailableLiquidityInUSDC$: ReturnType<
    typeof getAaveV2Services
  >['aaveAvailableLiquidityInUSDC$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveProtocolData$ instead
   */
  aaveProtocolData$: ReturnType<typeof getAaveV2Services>['aaveProtocolData$']
}

export type AppContext = ReturnType<typeof setupAppContext> & DepreciatedServices
