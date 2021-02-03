import { createSend, SendFunction } from '@oasisdex/transactions'
import { createWeb3Context$, Web3ContextConnected } from '@oasisdex/web3-context'
import { BigNumber } from 'bignumber.js'
import {
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas,
  EstimateGasFunction,
  SendTransactionFunction,
  TransactionDef,
} from 'blockchain/calls/callsHelpers'
import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from 'blockchain/calls/cdpManager'
import { createProxyAddress$, createProxyOwner$ } from 'blockchain/calls/proxy'
import { vatGem, vatIlk, vatUrns } from 'blockchain/calls/vat'
import { createGasPrice$ } from 'features/prices'
import { createReadonlyAccount$ } from 'components/connectWallet/readonlyAccount'
import { createAccountOverview$ } from 'features/accountOverview/accountOverview'
import { createDepositForm$, LockAndDrawData } from 'features/deposit/deposit'
import { createLanding$ } from 'features/landing/landing'
import { createVaultSummary } from 'features/vault/vaultSummary'

import { mapValues } from 'lodash'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { filter, map, shareReplay, switchMap } from 'rxjs/operators'

import { HasGasEstimation } from '../helpers/form'
import { createTransactionManager } from '../features/account/transactionManager'
import { catIlk } from '../blockchain/calls/cat'
import { tokenBalance } from '../blockchain/calls/erc20'
import { jugIlk } from '../blockchain/calls/jug'
import { observe } from '../blockchain/calls/observe'
import { spotIlk, spotPar } from '../blockchain/calls/spot'
import { networksById } from '../blockchain/config'
import {
  ContextConnected,
  createAccount$,
  createContext$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from '../blockchain/network'
import {
  createBalances$,
  createBalance$,
  createCollaterals$,
  createTokens$,
} from 'blockchain/tokens'
import {
  createController$,
  createTokenOraclePrice$,
  createVault$,
  createVaults$,
} from 'blockchain/vaults'
import {
  createIlkData$,
  createIlkDataList$,
  createIlkDataSummary$,
  createIlks$,
} from 'blockchain/ilks'

export type TxData = LockAndDrawData
// | ApproveData
// | DisapproveData

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

  // web3Context$.subscribe((web3Context) =>
  //   console.log(
  //     'web3Context:',
  //     web3Context.status,
  //     (web3Context as any).chainId,
  //     (web3Context as any).account,
  //   ),
  // )

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$, readonlyAccount$)

  const connectedContext$ = context$.pipe(
    filter(({ status }) => status === 'connected'),
    shareReplay(1),
  ) as Observable<ContextConnected>

  const [send, transactions$] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    connectedContext$,
  )

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$).pipe(
    map((x) => BigNumber.max(x.plus(1), x.multipliedBy(1.01).decimalPlaces(0, 0))),
  )

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)
  const transactionManager$ = createTransactionManager(transactions$)

  // base
  const proxyAddress$ = curry(createProxyAddress$)(connectedContext$)
  const proxyOwner$ = curry(createProxyOwner$)(connectedContext$)
  const cdpManagerUrns$ = observe(onEveryBlock$, context$, cdpManagerUrns, bigNumerTostring)
  const cdpManagerIlks$ = observe(onEveryBlock$, context$, cdpManagerIlks, bigNumerTostring)
  const cdpManagerOwner$ = observe(onEveryBlock$, context$, cdpManagerOwner, bigNumerTostring)
  const vatIlks$ = observe(onEveryBlock$, context$, vatIlk)
  const vatUrns$ = observe(onEveryBlock$, context$, vatUrns, ilkUrnAddressTostring)
  const vatGem$ = observe(onEveryBlock$, context$, vatGem, ilkUrnAddressTostring)
  const spotPar$ = observe(onEveryBlock$, context$, spotPar)
  const spotIlks$ = observe(onEveryBlock$, context$, spotIlk)
  const jugIlks$ = observe(onEveryBlock$, context$, jugIlk)
  const catIlks$ = observe(onEveryBlock$, context$, catIlk)

  const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance)
  const balance$ = curry(createBalance$)(onEveryBlock$, context$, tokenBalance$)
  const balances$ = curry(createBalances$)(balance$)

  const collaterals$ = createCollaterals$(context$)
  const tokens$ = createTokens$(context$)

  // computed
  const tokenOraclePrice$ = memoize(curry(createTokenOraclePrice$)(vatIlks$, spotPar$, spotIlks$))

  const ilkData$ = memoize(curry(createIlkData$)(vatIlks$, spotIlks$, jugIlks$, catIlks$))

  const controller$ = memoize(
    curry(createController$)(proxyOwner$, cdpManagerOwner$),
    bigNumerTostring,
  )

  const vault$ = memoize(
    curry(createVault$)(
      cdpManagerUrns$,
      cdpManagerIlks$,
      cdpManagerOwner$,
      vatUrns$,
      vatGem$,
      ilkData$,
      tokenOraclePrice$,
      controller$,
    ),
    bigNumerTostring,
  )

  const vaults$ = curry(createVaults$)(connectedContext$, proxyAddress$, vault$)

  const vaultSummary$ = curry(createVaultSummary)(vaults$)

  const depositForm$ = memoize(
    curry(createDepositForm$)(connectedContext$, balance$, txHelpers$, vault$),
    bigNumerTostring,
  )

  const ilks$ = createIlks$(context$)

  const ilkDataList$ = createIlkDataList$(ilks$, ilkData$)

  const accountOverview$ = curry(createAccountOverview$)(
    vaults$,
    vaultSummary$,
    ilkDataList$,
    balances$(tokens$),
  )
  const landing$ = curry(createLanding$)(ilkDataList$)

  return {
    web3Context$,
    setupWeb3Context$,
    initializedAccount$,
    context$,
    onEveryBlock$,
    txHelpers$,
    readonlyAccount$,
    transactionManager$,
    proxyAddress$,
    proxyOwner$,
    vaults$,
    vault$,
    vaultSummary$,
    depositForm$,
    landing$,
    accountOverview$,
  }
}

function bigNumerTostring(v: BigNumber): string {
  return v.toString()
}

function ilkUrnAddressTostring({ ilk, urnAddress }: { ilk: string; urnAddress: string }): string {
  return `${ilk}-${urnAddress}`
}

export type AppContext = ReturnType<typeof setupAppContext>
