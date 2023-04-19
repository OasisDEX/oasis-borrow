import { createSend, SendFunction } from '@oasisdex/transactions'
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
import { createTokenBalance$ } from 'blockchain/erc20'
import { createGetRegistryCdps$ } from 'blockchain/getRegistryCdps'
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
import { compareBigNumber } from 'blockchain/network'
import { networksById } from 'blockchain/networksConfig'
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
  createCollateralTokens$,
} from 'blockchain/tokens'
import { charterIlks, cropJoinIlks } from 'blockchain/tokens/mainnet'
import {
  getPositionIdFromDpmProxy$,
  getUserDpmProxies$,
  getUserDpmProxy$,
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
import { createTransactionManager } from 'features/account/transactionManager'
import { getAjnaPoolsTableContent$ } from 'features/ajna/positions/common/observables/getAjnaPoolsTableContent'
import {
  getAjnaPosition$,
  getAjnaPositionsWithDetails$,
} from 'features/ajna/positions/common/observables/getAjnaPosition'
import { getAjnaProductCardsData$ } from 'features/ajna/positions/common/observables/getAjnaProductCardsData'
import {
  DpmPositionData,
  getDpmPositionData$,
} from 'features/ajna/positions/common/observables/getDpmPositionData'
import { createAutomationTriggersData } from 'features/automation/api/automationTriggersData'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
  AutoBSChangeAction,
  AutoBSFormChange,
  autoBSFormChangeReducer,
} from 'features/automation/common/state/autoBSFormChange'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
  AutomationChangeFeatureAction,
  automationChangeFeatureReducer,
} from 'features/automation/common/state/automationFeatureChange'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
  AutoTakeProfitFormChangeAction,
  autoTakeProfitFormChangeReducer,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleChangeAction,
  ConstantMultipleFormChange,
  constantMultipleFormChangeReducer,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import {
  MULTIPLY_VAULT_PILL_CHANGE_SUBJECT,
  MultiplyPillChange,
  MultiplyPillChangeAction,
  multiplyPillChangeReducer,
} from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange'
import {
  formChangeReducer,
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
  StopLossFormChangeAction,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
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
import { createCollateralPrices$ } from 'features/collateralPrices/collateralPrices'
import { currentContent } from 'features/content'
import { createDaiDeposit$ } from 'features/dsr/helpers/daiDeposit'
import { createDsrDeposit$ } from 'features/dsr/helpers/dsrDeposit'
import { createDsrHistory$ } from 'features/dsr/helpers/dsrHistory'
import { chi, dsr, Pie, pie } from 'features/dsr/helpers/potCalls'
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
import {
  FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE,
  FollowedVaultsLimitReachedChange,
  FollowedVaultsLimitReachedChangeAction,
  followedVaultsLimitReachedChangeReducer,
} from 'features/follow/common/followedVaultsLimitReached'
import { createGeneralManageVault$ } from 'features/generalManageVault/generalManageVault'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
  TabChangeAction,
  tabChangeReducer,
} from 'features/generalManageVault/TabChange'
import { VaultType } from 'features/generalManageVault/vaultType'
import { getOasisStats$ } from 'features/homepage/stats'
import { createIlkDataListWithBalances$ } from 'features/ilks/ilksWithBalances'
import { createManageMultiplyVault$ } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createOpenMultiplyVault$ } from 'features/multiply/open/pipes/openMultiplyVault'
import { createVaultsNotices$ } from 'features/notices/vaultsNotices'
import {
  NOTIFICATION_CHANGE,
  NotificationChange,
  NotificationChangeAction,
  notificationReducer,
} from 'features/notifications/notificationChange'
import { createReclaimCollateral$ } from 'features/reclaimCollateral/reclaimCollateral'
import { checkReferralLocalStorage$ } from 'features/referralOverview/referralLocal'
import { createUserReferral$ } from 'features/referralOverview/user'
import {
  getReferralsFromApi$,
  getUserFromApi$,
  getWeeklyClaimsFromApi$,
} from 'features/referralOverview/userApi'
import { redirectState$ } from 'features/router/redirectState'
import {
  BalanceInfo,
  createBalanceInfo$,
  createBalancesArrayInfo$,
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
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  swapWidgetChangeReducer,
  SwapWidgetState,
} from 'features/uniswapWidget/SwapWidgetChange'
import { createUserSettings$ } from 'features/userSettings/userSettings'
import {
  checkUserSettingsLocalStorage$,
  saveUserSettingsLocalStorage$,
} from 'features/userSettings/userSettingsLocal'
import { createVaultHistory$ } from 'features/vaultHistory/vaultHistory'
import { vaultsWithHistory$ } from 'features/vaultHistory/vaultsHistory'
import { createAssetActions$ } from 'features/vaultsOverview/pipes/assetActions'
import {
  createAavePosition$,
  createMakerPositions$,
  createPositions$,
} from 'features/vaultsOverview/pipes/positions'
import { createMakerPositionsList$ } from 'features/vaultsOverview/pipes/positionsList'
import { createPositionsOverviewSummary$ } from 'features/vaultsOverview/pipes/positionsOverviewSummary'
import { createPositionsList$, createVaultsOverview$ } from 'features/vaultsOverview/vaultsOverview'
import { createWalletAssociatedRisk$ } from 'features/walletAssociatedRisk/walletRisk'
import { createWeb3Context$ } from 'features/web3Context'
import { getYieldChange$, getYields$ } from 'helpers/earn/calculations'
import { doGasEstimation, HasGasEstimation } from 'helpers/form'
import {
  gasEstimationReducer,
  TX_DATA_CHANGE,
  TxPayloadChange,
  TxPayloadChangeAction,
} from 'helpers/gasEstimate'
import { getGasMultiplier } from 'helpers/getGasMultiplier'
import {
  createProductCardsData$,
  createProductCardsWithBalance$,
  supportedBorrowIlks,
  supportedEarnIlks,
  supportedMultiplyIlks,
} from 'helpers/productCards'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveV2Services } from 'lendingProtocols/aave-v2'
import { getAaveV3Services } from 'lendingProtocols/aave-v3'
import { AaveServices } from 'lendingProtocols/aaveCommon/AaveServices'
import { isEqual, mapValues, memoize } from 'lodash'
import moment from 'moment'
import { equals } from 'ramda'
import { combineLatest, defer, Observable, of, Subject } from 'rxjs'
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

export type SupportedUIChangeType =
  | StopLossFormChange
  | AutoBSFormChange
  | ConstantMultipleFormChange
  | TabChange
  | MultiplyPillChange
  | SwapWidgetState
  | AutomationChangeFeature
  | NotificationChange
  | TxPayloadChange
  | AutoTakeProfitFormChange
  | FollowedVaultsLimitReachedChange

export type LegalUiChanges = {
  StopLossFormChange: StopLossFormChangeAction
  AutoBSChange: AutoBSChangeAction
  TabChange: TabChangeAction
  MultiplyPillChange: MultiplyPillChangeAction
  SwapWidgetChange: SwapWidgetChangeAction
  AutomationChangeFeature: AutomationChangeFeatureAction
  ConstantMultipleChangeAction: ConstantMultipleChangeAction
  NotificationChange: NotificationChangeAction
  TxPayloadChange: TxPayloadChangeAction
  AutoTakeProfitFormChange: AutoTakeProfitFormChangeAction
  FollowedVaultsLimitReachedChangeAction: FollowedVaultsLimitReachedChangeAction
}

export type UIChanges = {
  subscribe: <T extends SupportedUIChangeType>(sub: string) => Observable<T>
  publish: <K extends LegalUiChanges[keyof LegalUiChanges]>(sub: string, event: K) => void
  lastPayload: <T extends SupportedUIChangeType>(sub: string) => T
  clear: (sub: string) => void
  configureSubject: <
    T extends SupportedUIChangeType,
    K extends LegalUiChanges[keyof LegalUiChanges],
  >(
    subject: string,
    reducer: (prev: T, event: K) => T,
    initialState?: T,
  ) => void
}

export type UIReducer = (prev: any, event: any) => any

export type ReducersMap = {
  [key: string]: UIReducer
}

const refreshInterval = 1000 * 60

function createUIChangesSubject(): UIChanges {
  const latest: any = {}

  const reducers: ReducersMap = {} //TODO: Is there a way to strongly type this ?

  interface PublisherRecord {
    subjectName: string
    payload: SupportedUIChangeType
  }

  const commonSubject = new Subject<PublisherRecord>()

  function subscribe<T extends SupportedUIChangeType>(subjectName: string): Observable<T> {
    return commonSubject.pipe(
      filter((x) => x.subjectName === subjectName),
      map((x) => x.payload as T),
      shareReplay(1),
    )
  }

  function publish<K extends LegalUiChanges[keyof LegalUiChanges]>(subjectName: string, event: K) {
    const accumulatedEvent = reducers.hasOwnProperty(subjectName)
      ? reducers[subjectName](lastPayload(subjectName) || {}, event)
      : lastPayload(subjectName)
    latest[subjectName] = accumulatedEvent
    commonSubject.next({
      subjectName,
      payload: accumulatedEvent,
    })
  }

  function lastPayload<T>(subject: string): T {
    return latest[subject]
  }

  function clear(subject: string): any {
    delete latest[subject]
  }

  function configureSubject<
    T extends SupportedUIChangeType,
    K extends LegalUiChanges[keyof LegalUiChanges],
  >(subject: string, reducer: (prev: T, event: K) => T, initialState?: T): void {
    reducers[subject] = reducer
    if (initialState) {
      latest[subject] = initialState
    }
  }

  return {
    subscribe,
    publish,
    lastPayload,
    clear,
    configureSubject,
  }
}

function initializeUIChanges() {
  const uiChangesSubject = createUIChangesSubject()

  uiChangesSubject.configureSubject(STOP_LOSS_FORM_CHANGE, formChangeReducer)
  uiChangesSubject.configureSubject(AUTO_SELL_FORM_CHANGE, autoBSFormChangeReducer)
  uiChangesSubject.configureSubject(AUTO_BUY_FORM_CHANGE, autoBSFormChangeReducer)
  uiChangesSubject.configureSubject(TAB_CHANGE_SUBJECT, tabChangeReducer)
  uiChangesSubject.configureSubject(MULTIPLY_VAULT_PILL_CHANGE_SUBJECT, multiplyPillChangeReducer)
  uiChangesSubject.configureSubject(SWAP_WIDGET_CHANGE_SUBJECT, swapWidgetChangeReducer)
  uiChangesSubject.configureSubject(AUTOMATION_CHANGE_FEATURE, automationChangeFeatureReducer)
  uiChangesSubject.configureSubject(
    CONSTANT_MULTIPLE_FORM_CHANGE,
    constantMultipleFormChangeReducer,
  )
  uiChangesSubject.configureSubject(NOTIFICATION_CHANGE, notificationReducer)
  uiChangesSubject.configureSubject(TX_DATA_CHANGE, gasEstimationReducer)
  uiChangesSubject.configureSubject(AUTO_TAKE_PROFIT_FORM_CHANGE, autoTakeProfitFormChangeReducer)
  uiChangesSubject.configureSubject(
    FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE,
    followedVaultsLimitReachedChangeReducer,
  )
  return uiChangesSubject
}

export function setupAppContext() {
  const once$ = of(undefined).pipe(shareReplay(1))
  const chainIdToRpcUrl = mapValues(networksById, (network) => network.rpcCallsEndpoint)
  const [web3Context$, setupWeb3Context$, switchChains] = createWeb3Context$(chainIdToRpcUrl)

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
        mixpanelIdentify(account, { walletType: connectionKind, walletLabel: walletLabel })
        trackingEvents.accountChange(account, networkName, connectionKind, method, walletLabel)
      }
    })

  const oracleContext$ = context$.pipe(
    switchMap((ctx) => of({ ...ctx, account: getNetworkContracts(ctx.chainId).mcdSpot.address })),
    shareReplay(1),
  ) as Observable<ContextConnected>

  const [send, transactions$] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    // @ts-ignore
    connectedContext$,
  )

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$)

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)
  const transactionManager$ = createTransactionManager(transactions$)

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
    context$,
    refresh$: onEveryBlock$,
    once$,
  })

  const aaveV3 = getAaveV3Services({ context$, refresh$: onEveryBlock$, once$ })

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

  const balance$ = memoize(
    curry(createBalance$)(onEveryBlock$, chainContext$, tokenBalance$),
    (token, address) => `${token}_${address}`,
  )

  const balanceLean$ = memoize(
    curry(createBalance$)(once$, chainContext$, tokenBalanceLean$),
    (token, address) => `${token}_${address}`,
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

  const daiBalance$ = memoize(
    (addressFromUrl: string) =>
      context$.pipe(
        switchMap((context) => {
          return everyBlock$(createTokenBalance$(context, 'DAI', addressFromUrl), compareBigNumber)
        }),
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
        daiBalance$(addressFromUrl),
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
    ) => createExchangeQuote$(context$, undefined, token, slippage, amount, action, exchangeType),
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
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const automationTriggersData$ = memoize(
    curry(createAutomationTriggersData)(chainContext$, onEveryBlock$, proxiesRelatedWithPosition$),
  )

  const aavePositions$ = memoize(
    curry(createAavePosition$)(
      {
        dsProxy$: proxyAddress$,
        userDpmProxies$,
      },
      {
        tickerPrices$: tokenPriceUSDStatic$,
        context$,
        automationTriggersData$,
        readPositionCreatedEvents$,
      },
      aaveV2,
      aaveV3,
    ),
  )

  const makerPositions$ = memoize(curry(createMakerPositions$)(vaultWithValue$))
  const positions$ = memoize(curry(createPositions$)(makerPositions$, aavePositions$))

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

  const uiChanges = initializeUIChanges()

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

  const collateralPrices$ = createCollateralPrices$(collateralTokens$, oraclePriceDataLean$)

  const productCardsData$ = memoize(
    curry(createProductCardsData$)(ilksSupportedOnNetwork$, ilkDataLean$, oraclePriceDataLean$),
    (ilks: string[]) => {
      return ilks.join(',')
    },
  )

  const productCardsWithBalance$ = createProductCardsWithBalance$(
    ilksWithBalance$,
    oraclePriceDataLean$,
  )

  const vaultsHistoryAndValue$ = memoize(
    curry(vaultsWithHistory$)(chainContext$, vaultWithValue$, refreshInterval),
  )

  const positionsList$ = memoize(
    curry(createMakerPositionsList$)(context$, ilksWithBalance$, vaultsHistoryAndValue$),
  )

  const vaultsOverview$ = memoize(curry(createVaultsOverview$)(positionsList$, aavePositions$))

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

  const accountData$ = createAccountData(
    web3Context$,
    balance$,
    vaults$,
    hasActiveDsProxyAavePosition$,
    readPositionCreatedEvents$,
    ensName$,
  )

  const makerOracleTokenPrices$ = memoize(
    curry(createMakerOracleTokenPrices$)(chainContext$),
    (token: string, timestamp: moment.Moment) => {
      return `${token}-${timestamp.format('YYYY-MM-DD HH:mm')}`
    },
  )

  const makerOracleTokenPricesForDates$ = memoize(
    curry(createMakerOracleTokenPricesForDates$)(chainContext$),
    (token: string, timestamps: moment.Moment[]) => {
      return `${token}-${timestamps.map((t) => t.format('YYYY-MM-DD HH:mm')).join(' ')}`
    },
  )

  const yields$ = memoize(
    (ilk: string, date?: moment.Moment) => {
      return getYields$(makerOracleTokenPricesForDates$, ilkData$, ilk, date)
    },
    (ilk: string, date: moment.Moment = moment()) => `${ilk}-${date.format('YYYY-MM-DD')}`,
  )

  const yieldsChange$ = memoize(
    curry(getYieldChange$)(yields$),
    (currentDate: moment.Moment, previousDate: moment.Moment, ilk: string) =>
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

  const ajnaPoolsTableData$ = curry(getAjnaPoolsTableContent$)(context$, tokenPriceUSDStatic$)
  const ajnaProductCardsData$ = curry(getAjnaProductCardsData$)(context$, once$)

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
    [LendingProtocol.AaveV3]: aaveV3,
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

  const ajnaPosition$ = memoize(
    curry(getAjnaPosition$)(context$, onEveryBlock$),
    (collateralPrice: BigNumber, quotePrice: BigNumber, dpmPositionData: DpmPositionData) =>
      `${dpmPositionData.vaultId}-${collateralPrice.decimalPlaces(2).toString()}-${quotePrice
        .decimalPlaces(2)
        .toString()}`,
  )

  return {
    web3Context$,
    web3ContextConnected$,
    setupWeb3Context$,
    initializedAccount$,
    context$,
    onEveryBlock$,
    txHelpers$,
    transactionManager$,
    proxyAddress$,
    proxyOwner$,
    vaults$,
    vault$,
    ilks$: ilksSupportedOnNetwork$,
    balance$,
    balancesInfoArray$,
    accountBalances$,
    openVault$,
    manageVault$,
    manageInstiVault$,
    manageMultiplyVault$,
    manageGuniVault$,
    vaultsOverview$,
    vaultBanners$,
    redirectState$,
    gasPrice$,
    automationTriggersData$,
    accountData$,
    vaultHistory$,
    collateralPrices$,
    termsAcceptance$,
    walletAssociatedRisk$,
    reclaimCollateral$,
    openMultiplyVault$,
    generalManageVault$,
    userSettings$,
    openGuniVault$,
    ilkDataList$,
    uiChanges,
    connectedContext$,
    productCardsData$,
    getOasisStats$: memoize(getOasisStats$),
    productCardsWithBalance$,
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
    ajnaPosition$,
    chainContext$,
    positionIdFromDpmProxy$,
    switchChains,
    ajnaPoolsTableData$,
    ajnaProductCardsData$,
  }
}

export function bigNumberTostring(v: BigNumber): string {
  return v.toString()
}

function ilkUrnAddressToString({ ilk, urnAddress }: { ilk: string; urnAddress: string }): string {
  return `${ilk}-${urnAddress}`
}

export type ProtocolsServices = {
  [LendingProtocol.AaveV2]: ReturnType<typeof getAaveV2Services> & AaveServices
  [LendingProtocol.AaveV3]: ReturnType<typeof getAaveV3Services> & AaveServices
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
