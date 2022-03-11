import { createSend, SendFunction } from '@oasisdex/transactions'
import { createWeb3Context$ } from '@oasisdex/web3-context'
import { trackingEvents } from 'analytics/analytics'
import { mixpanelIdentify } from 'analytics/mixpanel'
import { BigNumber } from 'bignumber.js'
import {
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
} from 'blockchain/calls/automationBot'
import {
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas,
  EstimateGasFunction,
  SendTransactionFunction,
  TransactionDef,
} from 'blockchain/calls/callsHelpers'
import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from 'blockchain/calls/cdpManager'
import { charterNib, charterPeace, charterUline } from 'blockchain/calls/charter'
import { pipHop, pipPeek, pipPeep, pipZzz } from 'blockchain/calls/osm'
import {
  CreateDsProxyData,
  createProxyAddress$,
  createProxyOwner$,
  SetProxyOwnerData,
} from 'blockchain/calls/proxy'
import {
  CloseGuniMultiplyData,
  CloseVaultData,
  DepositAndGenerateData,
  MultiplyAdjustData,
  OpenData,
  OpenGuniMultiplyData,
  OpenMultiplyData,
  ReclaimData,
  WithdrawAndPaybackData,
  withdrawPaybackDepositGenerateLogicFactory,
} from 'blockchain/calls/proxyActions/proxyActions'
import { vatGem, vatIlk, vatUrns } from 'blockchain/calls/vat'
import { resolveENSName$ } from 'blockchain/ens'
import { createIlkData$, createIlkDataList$, createIlks$ } from 'blockchain/ilks'
import { createInstiVault$, InstiVault } from 'blockchain/instiVault'
import {
  createGasPrice$,
  createOraclePriceData$,
  GasPriceParams,
  tokenPricesInUSD$,
} from 'blockchain/prices'
import {
  createAccountBalance$,
  createAllowance$,
  createBalance$,
  createCollateralTokens$,
} from 'blockchain/tokens'
import { createController$, createVault$, createVaults$, Vault } from 'blockchain/vaults'
import { pluginDevModeHelpers } from 'components/devModeHelpers'
import { createAccountData } from 'features/account/AccountData'
import {
  ADD_FORM_CHANGE,
  AddFormChange,
  AddFormChangeAction,
  formChangeReducer,
} from 'features/automation/common/UITypes/AddFormChange'
import {
  PROTECTION_MODE_CHANGE_SUBJECT,
  ProtectionModeChange,
  ProtectionModeChangeAction,
  protectionModeChangeReducer,
} from 'features/automation/common/UITypes/ProtectionFormModeChange'
import {
  REMOVE_FORM_CHANGE,
  RemoveFormChange,
  RemoveFormChangeAction,
  removeFormReducer,
} from 'features/automation/common/UITypes/RemoveFormChange'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
  TabChangeAction,
  tabChangeReducer,
} from 'features/automation/common/UITypes/TabChange'
import { createAutomationTriggersData } from 'features/automation/triggers/AutomationTriggersData'
import { createVaultsBanners$ } from 'features/banners/vaultsBanners'
import {
  createManageVault$,
  ManageInstiVaultState,
  ManageStandardBorrowVaultState,
} from 'features/borrow/manage/pipes/manageVault'
import { createOpenVault$ } from 'features/borrow/open/pipes/openVault'
import { createCollateralPrices$ } from 'features/collateralPrices/collateralPrices'
import { currentContent } from 'features/content'
import { createOpenGuniVault$ } from 'features/earn/guni/open/pipes/openGuniVault'
import { createExchangeQuote$, ExchangeAction, ExchangeType } from 'features/exchange/exchange'
import { createGeneralManageVault$ } from 'features/generalManageVault/generalManageVault'
import { createIlkDataListWithBalances$ } from 'features/ilks/ilksWithBalances'
import { createManageMultiplyVault$ } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createOpenMultiplyVault$ } from 'features/multiply/open/pipes/openMultiplyVault'
import { createReclaimCollateral$ } from 'features/reclaimCollateral/reclaimCollateral'
import { redirectState$ } from 'features/router/redirectState'
import { createPriceInfo$ } from 'features/shared/priceInfo'
import { checkVaultTypeUsingApi$, saveVaultUsingApi$ } from 'features/shared/vaultApi'
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
import { createVaultMultiplyHistory$ } from 'features/vaultHistory/vaultMultiplyHistory'
import { createVaultsOverview$ } from 'features/vaultsOverview/vaultsOverview'
import { isEqual, mapValues, memoize } from 'lodash'
import { curry } from 'ramda'
import { combineLatest, Observable, of, Subject } from 'rxjs'
import { distinctUntilChanged, filter, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'

import { dogIlk } from '../blockchain/calls/dog'
import {
  ApproveData,
  DisapproveData,
  tokenAllowance,
  tokenBalance,
} from '../blockchain/calls/erc20'
import { jugIlk } from '../blockchain/calls/jug'
import { observe } from '../blockchain/calls/observe'
import { CharteredDssProxyActionsContractWrapper } from '../blockchain/calls/proxyActions/charteredDssProxyActionsContractWrapper'
import { StandardDssProxyActionsContractWrapper } from '../blockchain/calls/proxyActions/standardDssProxyActionsContractWrapper'
import { spotIlk } from '../blockchain/calls/spot'
import { networksById } from '../blockchain/config'
import {
  ContextConnected,
  createAccount$,
  createContext$,
  createContextConnected$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from '../blockchain/network'
import { createTransactionManager } from '../features/account/transactionManager'
import { InstitutionalBorrowManageVaultViewStateProvider } from '../features/borrow/manage/pipes/viewStateProviders/institutionalBorrowManageVaultViewStateProvider'
import { StandardBorrowManageVaultViewStateProvider } from '../features/borrow/manage/pipes/viewStateProviders/standardBorrowManageVaultViewStateProvider'
import {
  getTotalSupply,
  getUnderlyingBalances,
} from '../features/earn/guni/manage/pipes/guniActionsCalls'
import { createManageGuniVault$ } from '../features/earn/guni/manage/pipes/manageGuniVault'
import {
  getGuniMintAmount,
  getToken1Balance,
} from '../features/earn/guni/open/pipes/guniActionsCalls'
import { VaultType } from '../features/generalManageVault/vaultType'
import { BalanceInfo, createBalanceInfo$ } from '../features/shared/balanceInfo'
import { createCheckVaultType$, VaultIdToTypeMapping } from '../features/shared/checkVaultType'
import { jwtAuthSetupToken$ } from '../features/termsOfService/jwt'
import { createTermsAcceptance$ } from '../features/termsOfService/termsAcceptance'
import { doGasEstimation, HasGasEstimation } from '../helpers/form'
import { createProductCardsData$ } from '../helpers/productCards'

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
  | AutomationBotRemoveTriggerData
  | CloseGuniMultiplyData

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

export const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])

function createTxHelpers$(
  context$: Observable<ContextConnected>,
  send: SendFunction<TxData>,
  gasPrice$: Observable<GasPriceParams>,
): TxHelpers$ {
  return context$.pipe(
    filter(({ status }) => status === 'connected'),
    map((context) => ({
      send: createSendTransaction(send, context),
      sendWithGasEstimation: createSendWithGasConstraints(send, context, gasPrice$),
      estimateGas: <B extends TxData>(def: TransactionDef<B>, args: B): Observable<number> => {
        return estimateGas(context, def, args)
      },
    })),
  )
}

export type SupportedUIChangeType =
  | AddFormChange
  | RemoveFormChange
  | TabChange
  | ProtectionModeChange

export type LegalUiChanges = {
  AddFormChange: AddFormChangeAction
  RemoveFormChange: RemoveFormChangeAction
  TabChange: TabChangeAction
  ProtectionModeChange: ProtectionModeChangeAction
}

export type UIChanges = {
  subscribe: <T extends SupportedUIChangeType>(sub: string) => Observable<T>
  publish: <K extends LegalUiChanges[keyof LegalUiChanges]>(sub: string, event: K) => void
  lastPayload: <T extends SupportedUIChangeType>(sub: string) => T
  clear: (sub: string) => void
  configureSubject: <
    T extends SupportedUIChangeType,
    K extends LegalUiChanges[keyof LegalUiChanges]
  >(
    subject: string,
    reducer: (prev: T, event: K) => T,
  ) => void
}

export type UIReducer = (prev: any, event: any) => any

export type ReducersMap = {
  [key: string]: UIReducer
}

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
    const val: T = latest[subject]
    return val
  }

  function clear(subject: string): any {
    delete latest[subject]
  }

  function configureSubject<
    T extends SupportedUIChangeType,
    K extends LegalUiChanges[keyof LegalUiChanges]
  >(subject: string, reducer: (prev: T, event: K) => T): void {
    reducers[subject] = reducer
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

  uiChangesSubject.configureSubject(ADD_FORM_CHANGE, formChangeReducer)
  uiChangesSubject.configureSubject(REMOVE_FORM_CHANGE, removeFormReducer)
  uiChangesSubject.configureSubject(TAB_CHANGE_SUBJECT, tabChangeReducer)
  uiChangesSubject.configureSubject(PROTECTION_MODE_CHANGE_SUBJECT, protectionModeChangeReducer)

  return uiChangesSubject
}

export function setupAppContext() {
  const chainIdToRpcUrl = mapValues(networksById, (network) => network.infuraUrl)
  const chainIdToDAIContractDesc = mapValues(networksById, (network) => network.tokens.DAI)
  const [web3Context$, setupWeb3Context$] = createWeb3Context$(
    chainIdToRpcUrl,
    chainIdToDAIContractDesc,
  )

  const account$ = createAccount$(web3Context$)
  const initializedAccount$ = createInitializedAccount$(account$)

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$)

  const connectedContext$ = createContextConnected$(context$)

  combineLatest(account$, connectedContext$)
    .pipe(
      mergeMap(([account, network]) => {
        return of({
          networkName: network.name,
          connectionKind: network.connectionKind,
          account: account?.toLowerCase(),
        })
      }),
      distinctUntilChanged(isEqual),
    )
    .subscribe(({ account, networkName, connectionKind }) => {
      if (account) {
        mixpanelIdentify(account, { walletType: connectionKind })
        trackingEvents.accountChange(account, networkName, connectionKind)
      }
    })

  const oracleContext$ = context$.pipe(
    switchMap((ctx) => of({ ...ctx, account: ctx.mcdSpot.address })),
    shareReplay(1),
  ) as Observable<ContextConnected>

  const [send, transactions$] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    connectedContext$,
  )

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$)

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)
  const transactionManager$ = createTransactionManager(transactions$)

  function addGasEstimation$<S extends HasGasEstimation>(
    state: S,
    call: (send: TxHelpers, state: S) => Observable<number> | undefined,
  ): Observable<S> {
    return doGasEstimation(gasPrice$, tokenPricesInUSD$, txHelpers$, state, call)
  }

  // base
  const proxyAddress$ = memoize(curry(createProxyAddress$)(onEveryBlock$, context$))
  const proxyOwner$ = memoize(curry(createProxyOwner$)(onEveryBlock$, context$))
  const cdpManagerUrns$ = observe(onEveryBlock$, context$, cdpManagerUrns, bigNumberTostring)
  const cdpManagerIlks$ = observe(onEveryBlock$, context$, cdpManagerIlks, bigNumberTostring)
  const cdpManagerOwner$ = observe(onEveryBlock$, context$, cdpManagerOwner, bigNumberTostring)
  const vatIlks$ = observe(onEveryBlock$, context$, vatIlk)
  const vatUrns$ = observe(onEveryBlock$, context$, vatUrns, ilkUrnAddressToString)
  const vatGem$ = observe(onEveryBlock$, context$, vatGem, ilkUrnAddressToString)
  const spotIlks$ = observe(onEveryBlock$, context$, spotIlk)
  const jugIlks$ = observe(onEveryBlock$, context$, jugIlk)
  const dogIlks$ = observe(onEveryBlock$, context$, dogIlk)

  const charterNib$ = observe(onEveryBlock$, context$, charterNib)
  const charterPeace$ = observe(onEveryBlock$, context$, charterPeace)
  const charterUline$ = observe(onEveryBlock$, context$, charterUline)

  const pipZzz$ = observe(onEveryBlock$, context$, pipZzz)
  const pipHop$ = observe(onEveryBlock$, context$, pipHop)
  const pipPeek$ = observe(onEveryBlock$, oracleContext$, pipPeek)
  const pipPeep$ = observe(onEveryBlock$, oracleContext$, pipPeep)

  const oraclePriceData$ = memoize(
    curry(createOraclePriceData$)(context$, pipPeek$, pipPeep$, pipZzz$, pipHop$),
  )

  const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance)
  const balance$ = memoize(
    curry(createBalance$)(onEveryBlock$, context$, tokenBalance$),
    (token, address) => `${token}_${address}`,
  )
  const ensName$ = memoize(curry(resolveENSName$)(context$), (address) => address)

  const tokenAllowance$ = observe(onEveryBlock$, context$, tokenAllowance)
  const allowance$ = curry(createAllowance$)(context$, tokenAllowance$)

  const ilkData$ = memoize(
    curry(createIlkData$)(vatIlks$, spotIlks$, jugIlks$, dogIlks$, ilkToToken$),
  )

  const controller$ = memoize(
    curry(createController$)(proxyOwner$, cdpManagerOwner$),
    bigNumberTostring,
  )

  const vault$ = memoize(
    (id: BigNumber) =>
      createVault$(
        cdpManagerUrns$,
        cdpManagerIlks$,
        cdpManagerOwner$,
        vatUrns$,
        vatGem$,
        ilkData$,
        oraclePriceData$,
        controller$,
        ilkToToken$,
        context$,
        id,
      ),
    bigNumberTostring,
  )

  const instiVault$ = memoize(
    // todo: insti-vault switch back to smart contract vaules when contract is deployed
    curry(createInstiVault$)(vault$, charterNib$, charterPeace$, charterUline$),
    // curry(createInstiVault$)(
    //   vault$,
    //   () => of(new BigNumber(0.1)),
    //   () => of(new BigNumber(0.22)),
    //   () => of(new BigNumber(3)),
    // ),
  )

  const vaultHistory$ = memoize(curry(createVaultHistory$)(context$, onEveryBlock$, vault$))
  const vaultMultiplyHistory$ = memoize(
    curry(createVaultMultiplyHistory$)(context$, onEveryBlock$, vault$),
  )

  pluginDevModeHelpers(txHelpers$, connectedContext$, proxyAddress$)

  const vaults$ = memoize(curry(createVaults$)(onEveryBlock$, context$, proxyAddress$, vault$))

  const ilks$ = createIlks$(context$)

  const collateralTokens$ = createCollateralTokens$(ilks$, ilkToToken$)

  const accountBalances$ = curry(createAccountBalance$)(
    balance$,
    collateralTokens$,
    oraclePriceData$,
  )

  const ilkDataList$ = createIlkDataList$(ilkData$, ilks$)
  const ilksWithBalance$ = createIlkDataListWithBalances$(context$, ilkDataList$, accountBalances$)

  const priceInfo$ = curry(createPriceInfo$)(oraclePriceData$)

  // TODO Don't allow undefined args like this
  const balanceInfo$ = curry(createBalanceInfo$)(balance$) as (
    token: string,
    account: string | undefined,
  ) => Observable<BalanceInfo>

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
      ilks$,
      ilkData$,
      ilkToToken$,
      addGasEstimation$,
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

  const psmExchangeQuote$ = memoize(
    (
      token: string,
      slippage: BigNumber,
      amount: BigNumber,
      action: ExchangeAction,
      exchangeType: ExchangeType,
    ) => createExchangeQuote$(context$, 'PSM', token, slippage, amount, action, exchangeType),
    (token: string, slippage: BigNumber, amount: BigNumber, action: string, exchangeType: string) =>
      `${token}_${slippage.toString()}_${amount.toString()}_${action}_${exchangeType}`,
  )

  const openMultiplyVault$ = memoize((ilk: string) =>
    createOpenMultiplyVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilks$,
      ilkData$,
      exchangeQuote$,
      addGasEstimation$,
      userSettings$,
      ilk,
    ),
  )

  const token1Balance$ = observe(onEveryBlock$, context$, getToken1Balance)
  const getGuniMintAmount$ = observe(onEveryBlock$, context$, getGuniMintAmount)

  const openGuniVault$ = memoize((ilk: string) =>
    createOpenGuniVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilks$,
      ilkData$,
      psmExchangeQuote$,
      onEveryBlock$,
      addGasEstimation$,
      ilk,
      token1Balance$,
      getGuniMintAmount$,
      userSettings$,
    ),
  )

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
        withdrawPaybackDepositGenerateLogicFactory(StandardDssProxyActionsContractWrapper),
        StandardBorrowManageVaultViewStateProvider,
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
        withdrawPaybackDepositGenerateLogicFactory(CharteredDssProxyActionsContractWrapper),
        // comment out above and uncomment below to test insti vault flows + UI against standard borrow vault
        // withdrawPaybackDepositGenerateLogicFactory(StandardDssProxyActionsContractWrapper),
        InstitutionalBorrowManageVaultViewStateProvider,
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
        vaultMultiplyHistory$,
        saveVaultUsingApi$,
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
        psmExchangeQuote$,
        addGasEstimation$,
        getProportions$,
        vaultMultiplyHistory$,
        userSettings$,
        id,
      ),
    bigNumberTostring,
  )

  // const HARDCODED_VAULT_TYPES: VaultIdToTypeMapping = { 27609: VaultType.Insti }
  const HARDCODED_VAULT_TYPES: VaultIdToTypeMapping = {}

  const checkVault$: (id: BigNumber) => Observable<VaultType> = curry(createCheckVaultType$)(
    curry(checkVaultTypeUsingApi$)(context$),
    HARDCODED_VAULT_TYPES,
  )

  const generalManageVault$ = memoize(
    curry(createGeneralManageVault$)(
      manageInstiVault$,
      manageMultiplyVault$,
      manageGuniVault$,
      manageVault$,
      checkVault$,
      vault$,
    ),
    bigNumberTostring,
  )

  const collateralPrices$ = createCollateralPrices$(collateralTokens$, oraclePriceData$)

  const productCardsData$ = createProductCardsData$(ilkDataList$, priceInfo$)

  const vaultsOverview$ = memoize(curry(createVaultsOverview$)(vaults$, ilksWithBalance$))

  const termsAcceptance$ = createTermsAcceptance$(
    web3Context$,
    currentContent.tos.version,
    jwtAuthSetupToken$,
    checkAcceptanceFromApi$,
    saveAcceptanceFromApi$,
  )

  const vaultBanners$ = memoize(
    curry(createVaultsBanners$)(context$, priceInfo$, vault$, vaultHistory$),
    bigNumberTostring,
  )

  const reclaimCollateral$ = memoize(
    curry(createReclaimCollateral$)(context$, txHelpers$, proxyAddress$),
    bigNumberTostring,
  )
  const accountData$ = createAccountData(web3Context$, balance$, vaults$, ensName$)

  const automationTriggersData$ = memoize(
    curry(createAutomationTriggersData)(context$, onEveryBlock$, vault$),
  )

  const uiChanges = initializeUIChanges()

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
    ilks$,
    openVault$,
    manageVault$,
    manageInstiVault$,
    manageMultiplyVault$,
    manageGuniVault$,
    vaultsOverview$,
    vaultBanners$,
    redirectState$,
    accountBalances$,
    automationTriggersData$,
    accountData$,
    vaultHistory$,
    vaultMultiplyHistory$,
    collateralPrices$,
    termsAcceptance$,
    reclaimCollateral$,
    openMultiplyVault$,
    generalManageVault$,
    userSettings$,
    openGuniVault$,
    ilkDataList$,
    uiChanges,
    connectedContext$,
    productCardsData$,
    addGasEstimation$,
    instiVault$,
  }
}

export function bigNumberTostring(v: BigNumber): string {
  return v.toString()
}

function ilkUrnAddressToString({ ilk, urnAddress }: { ilk: string; urnAddress: string }): string {
  return `${ilk}-${urnAddress}`
}

export type AppContext = ReturnType<typeof setupAppContext>
