import { createSend, SendFunction } from '@oasisdex/transactions'
import { createWeb3Context$ } from '@oasisdex/web3-context'
import { BigNumber } from 'bignumber.js'
import { createTransactionManager } from 'components/account/transactionManager'
import {
  call,
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas,
  EstimateGasFunction,
  SendTransactionFunction,
  TransactionDef,
} from 'components/blockchain/calls/callsHelpers'
import { createGasPrice$, tokenPricesInUSD$ } from 'components/blockchain/prices'
import { createReadonlyAccount$ } from 'components/connectWallet/readonlyAccount'
import { createOnrampOrders$, OnrampOrder } from 'components/dashboard/onrampOrders'
import { doGasEstimation, HasGasEstimation } from 'helpers/form'
import { loadablifyLight } from 'helpers/loadable'
import { zero } from 'helpers/zero'
import { mapValues } from 'lodash'
import { equals } from 'ramda'
import { combineLatest, defer, Observable, of } from 'rxjs'
import { filter, map, mergeMap, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { trackingEvents } from './analytics/analytics'
import { mixpanelIdentify } from './analytics/mixpanel'
import { networksById } from './blockchain/config'
import { createAllowance$, createTokenBalance$ } from './blockchain/erc20'
import {
  compareBigNumber,
  ContextConnected,
  createAccount$,
  createContext$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from './blockchain/network'
import { createMagicLinkConnect$ } from './connectWallet/magicLink'
import { currentContent } from './content'
import { createCookies$ } from './cookies/cookies'
import { getAaveApy$ } from './dashboard/aave/aave'
import { getCompoundApy$ } from './dashboard/compound/compound'
import { createDaiDeposit$ } from './dashboard/daiDeposit'
import { createDashboard$ } from './dashboard/dashboard'
import { SetOwnerData, SetupDSProxyData } from './dashboard/dsrPot/dsProxyCalls'
import { createDsrDeposit$ } from './dashboard/dsrPot/dsrDeposit'
import { createDsrHistory$ } from './dashboard/dsrPot/dsrHistory'
import { createDsrCreation$ } from './dashboard/dsrPot/dsrPotCreate'
import { createDsrWithdraw$ } from './dashboard/dsrPot/dsrWithdraw'
import {
  ApproveData,
  DisapproveData,
  TransferErc20Data,
  TransferEthData,
} from './dashboard/dsrPot/erc20Calls'
import {
  chi,
  dsr,
  DsrExitAllData,
  DsrExitData,
  DsrJoinData,
  pie,
} from './dashboard/dsrPot/potCalls'
import { createErc20ExtEventsHistory$ } from './dashboard/erc20History'
import { createEthTransferHistory$ } from './dashboard/ethTransferHistory'
import { getLatamexRates$ } from './dashboard/onramp/latamex'
import { getMoonpayRates$ } from './dashboard/onramp/moonpay'
import { createOnrampForm$ } from './dashboard/onramp/onrampForm'
import { getWyreRates$ } from './dashboard/onramp/wyre'
import { createProxyAddress$ } from './dashboard/proxy'
import { createTokenSend$ } from './dashboard/tokenSend'
import { pluginDevModeHelpers } from './devModeHelpers'
import { jwtAuthSetupToken$ } from './termsOfService/jwt'
import { createTermsAcceptance$ } from './termsOfService/termsAcceptance'
import {
  checkAcceptanceFromApi$,
  saveAcceptanceFromApi$,
} from './termsOfService/termsAcceptanceApi'

export type TxData =
  | ApproveData
  | DisapproveData
  | SetupDSProxyData
  | SetOwnerData
  | DsrJoinData
  | DsrExitData
  | DsrExitAllData
  | TransferEthData
  | TransferErc20Data

export interface TxHelpers {
  send: SendTransactionFunction<TxData>
  sendWithGasEstimation: SendTransactionFunction<TxData>
  estimateGas: EstimateGasFunction<TxData>
}

export type AddGasEstimationFunction = <S extends HasGasEstimation>(
  state: S,
  call: (send: TxHelpers, state: S) => Observable<number> | undefined,
) => Observable<S>

export type TxHelpers$ = Observable<TxHelpers>

function createTxHelpers$(
  context$: Observable<ContextConnected>,
  send: SendFunction<TxData>,
  gasPrice$: Observable<BigNumber>,
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

export function setupAppContext() {
  const readonlyAccount$ = createReadonlyAccount$()

  const chainIdToRpcUrl = mapValues(networksById, (network) => network.infuraUrl)
  const chainIdToDAIContractDesc = mapValues(networksById, (network) => network.tokens.DAI)
  const [web3Context$, setupWeb3Context$] = createWeb3Context$(
    chainIdToRpcUrl,
    chainIdToDAIContractDesc,
  )

  const account$ = createAccount$(web3Context$)
  const initializedAccount$ = createInitializedAccount$(account$)

  web3Context$.subscribe((web3Context) =>
    console.log(
      'web3Context:',
      web3Context.status,
      (web3Context as any).chainId,
      (web3Context as any).account,
    ),
  )

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$, everyBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$, readonlyAccount$)

  const connectedContext$ = context$.pipe(
    filter(({ status }) => status === 'connected'),
    shareReplay(1),
  ) as Observable<ContextConnected>

  const [send, transactions$, dismissTransaction] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    connectedContext$,
  )

  combineLatest(account$, connectedContext$)
    .pipe(
      mergeMap(([account, network]) => {
        return of({ network, account: account?.toLowerCase() })
      }),
    )
    .subscribe(({ account, network }) => {
      if (account && network && process.env.NODE_ENV !== 'development') {
        mixpanelIdentify(account, { walletType: network.connectionKind })
        trackingEvents.accountChange(account, network.name, network.connectionKind)
      }
    })

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$).pipe(
    map((x) => BigNumber.max(x.plus(1), x.multipliedBy(1.01).decimalPlaces(0, 0))),
  )

  const proxyAddress$ = connectedContext$.pipe(
    switchMap((context) => everyBlock$(createProxyAddress$(context, context.account))),
    shareReplay(1),
  )

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)

  const dsrHistory$ = combineLatest(connectedContext$, proxyAddress$, onEveryBlock$).pipe(
    switchMap(([context, proxyAddress, _]) => {
      return proxyAddress ? defer(() => createDsrHistory$(context, proxyAddress)) : of([])
    }),
  )

  const potPie$ = combineLatest(connectedContext$, proxyAddress$).pipe(
    switchMap(([context, proxyAddress]) => {
      if (!proxyAddress) return of(zero)
      return everyBlock$(
        defer(() => call(context, pie)(proxyAddress!)),
        equals,
      )
    }),
  )

  const potDsr$ = connectedContext$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, dsr)()))
    }),
  )
  const potChi$ = connectedContext$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, chi)()))
    }),
  )

  const dashboard$ = createDashboard$(
    connectedContext$,
    everyBlock$,
    onEveryBlock$,
    tokenPricesInUSD$,
    dsrHistory$,
    potDsr$,
    potChi$,
    getCompoundApy$(),
    getAaveApy$(),
  )

  const daiBalance$ = connectedContext$.pipe(
    switchMap((context) => {
      return everyBlock$(createTokenBalance$(context, 'DAI', context.account), compareBigNumber)
    }),
  )

  const daiAllowance$ = combineLatest(connectedContext$, proxyAddress$).pipe(
    switchMap(([context, proxyAddress]) =>
      proxyAddress
        ? everyBlock$(createAllowance$(context, 'DAI', context.account, proxyAddress))
        : of(false),
    ),
  )

  const daiDeposit$ = createDaiDeposit$(potPie$, potChi$)

  const dsrCreation$ = createDsrCreation$(
    connectedContext$,
    txHelpers$,
    proxyAddress$,
    daiAllowance$,
    daiBalance$,
  )

  function addGasEstimation<S extends HasGasEstimation>(
    state: S,
    call: (send: TxHelpers, state: S) => Observable<number> | undefined,
  ): Observable<S> {
    return doGasEstimation(gasPrice$, tokenPricesInUSD$, txHelpers$, state, call)
  }

  const dsrDeposit$ = createDsrDeposit$(
    connectedContext$,
    txHelpers$,
    proxyAddress$,
    daiAllowance$,
    daiBalance$,
    addGasEstimation,
  )
  const dsrWithdraw$ = createDsrWithdraw$(
    txHelpers$,
    proxyAddress$,
    daiDeposit$,
    potDsr$,
    addGasEstimation,
  )
  const tokenSend$ = createTokenSend$(dashboard$, txHelpers$, addGasEstimation)

  pluginDevModeHelpers(txHelpers$, connectedContext$)

  const onrampOrders$: Observable<OnrampOrder[]> = connectedContext$.pipe(
    switchMap(({ account }) => everyBlock$(createOnrampOrders$(account), equals)),
    startWith([]),
  )

  const ethTransferEvents$ = createEthTransferHistory$(connectedContext$, onEveryBlock$)
  const ethTransferEventsLoading$ = loadablifyLight(ethTransferEvents$, onEveryBlock$)

  const erc20ExtEvents$ = createErc20ExtEventsHistory$(
    connectedContext$,
    1,
    'DAI',
    dsrHistory$,
    onEveryBlock$,
  )

  const erc20Events$ = loadablifyLight(erc20ExtEvents$, onEveryBlock$)

  const transactionManager$ = createTransactionManager(transactions$, onrampOrders$)

  const onrampForm$ = createOnrampForm$(
    initializedAccount$,
    connectedContext$,
    getWyreRates$(),
    getMoonpayRates$(),
    getLatamexRates$(),
  )

  const magicLinkConnect$ = createMagicLinkConnect$(web3Context$)
  const termsAcceptance$ = createTermsAcceptance$(
    web3Context$,
    currentContent.tos.version,
    jwtAuthSetupToken$,
    checkAcceptanceFromApi$,
    saveAcceptanceFromApi$,
  )

  const cookies$ = createCookies$()

  return {
    web3Context$,
    setupWeb3Context$,
    initializedAccount$,
    context$,
    dismissTransaction,
    txHelpers$,
    onEveryBlock$,
    dashboard$,
    dsrCreation$,
    dsrDeposit$,
    dsrWithdraw$,
    tokenSend$,
    transactionManager$,
    erc20Events$,
    ethTransferEventsLoading$,
    onrampForm$,
    readonlyAccount$,
    magicLinkConnect$,
    termsAcceptance$,
    cookies$,
  }
}

export type AppContext = ReturnType<typeof setupAppContext>
