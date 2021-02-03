import { createSend, SendFunction } from '@oasisdex/transactions'
import { createWeb3Context$ } from '@oasisdex/web3-context'
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
import { CreateDsProxyData, createProxyAddress$, createProxyOwner$ } from 'blockchain/calls/proxy'
import { vatGem, vatIlk, vatUrns } from 'blockchain/calls/vat'
import { createReadonlyAccount$ } from 'components/connectWallet/readonlyAccount'
import { createVaultsOverview$ } from 'features/vaultsOverview/vaultsOverview'
import { createDepositForm$, LockAndDrawData } from 'features/deposit/deposit'
import { createLanding$ } from 'features/landing/landing'

import { mapValues } from 'lodash'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { filter, map, shareReplay } from 'rxjs/operators'

import { HasGasEstimation } from '../helpers/form'
import { createTransactionManager } from '../features/account/transactionManager'
import { catIlk } from '../blockchain/calls/cat'
import { ApproveData, tokenAllowance, tokenBalance } from '../blockchain/calls/erc20'
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
import { createBalance$, createAllowance$ } from 'blockchain/tokens'
import {
  createController$,
  createVault$,
  createVaults$,
  createVaultSummary$,
} from 'blockchain/vaults'
import { createIlkData$, createIlkDataList$, createIlks$ } from 'blockchain/ilks'
import { createGasPrice$, createTokenOraclePrice$ } from 'blockchain/prices'
import { createOpenVault$ } from 'features/openVault/openVault'

export type TxData = LockAndDrawData | ApproveData | CreateDsProxyData
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
  const proxyAddress$ = memoize(curry(createProxyAddress$)(connectedContext$))
  const proxyOwner$ = memoize(curry(createProxyOwner$)(connectedContext$))
  const cdpManagerUrns$ = observe(onEveryBlock$, context$, cdpManagerUrns, bigNumberTostring)
  const cdpManagerIlks$ = observe(onEveryBlock$, context$, cdpManagerIlks, bigNumberTostring)
  const cdpManagerOwner$ = observe(onEveryBlock$, context$, cdpManagerOwner, bigNumberTostring)
  const vatIlks$ = observe(onEveryBlock$, context$, vatIlk)
  const vatUrns$ = observe(onEveryBlock$, context$, vatUrns, ilkUrnAddressTostring)
  const vatGem$ = observe(onEveryBlock$, context$, vatGem, ilkUrnAddressTostring)
  const spotPar$ = observe(onEveryBlock$, context$, spotPar)
  const spotIlks$ = observe(onEveryBlock$, context$, spotIlk)
  const jugIlks$ = observe(onEveryBlock$, context$, jugIlk)
  const catIlks$ = observe(onEveryBlock$, context$, catIlk)

  const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance)
  const balance$ = curry(createBalance$)(onEveryBlock$, context$, tokenBalance$)

  const tokenAllowance$ = observe(onEveryBlock$, context$, tokenAllowance)
  const allowance$ = curry(createAllowance$)(context$, tokenAllowance$)

  // computed
  const tokenOraclePrice$ = memoize(curry(createTokenOraclePrice$)(vatIlks$, spotPar$, spotIlks$))

  const ilkData$ = memoize(curry(createIlkData$)(vatIlks$, spotIlks$, jugIlks$, catIlks$))

  const controller$ = memoize(
    curry(createController$)(proxyOwner$, cdpManagerOwner$),
    bigNumberTostring,
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
    bigNumberTostring,
  )

  const vaults$ = memoize(curry(createVaults$)(connectedContext$, proxyAddress$, vault$))

  const vaultSummary$ = memoize(curry(createVaultSummary$)(vaults$))

  const depositForm$ = memoize(
    curry(createDepositForm$)(connectedContext$, balance$, txHelpers$, vault$),
    bigNumberTostring,
  )

  const ilks$ = createIlks$(context$)
  const ilkDataList$ = createIlkDataList$(ilks$, ilkData$)

  const vaultsOverview$ = memoize(
    curry(createVaultsOverview$)(connectedContext$, vaults$, vaultSummary$, ilkDataList$),
  )
  const landing$ = curry(createLanding$)(ilkDataList$)

  const openVault$ = curry(createOpenVault$)(
    connectedContext$,
    txHelpers$,
    proxyAddress$,
    allowance$,
    balance$,
    ilkData$,
  )

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
    openVault$,
    vaultsOverview$,
  }
}

function bigNumberTostring(v: BigNumber): string {
  return v.toString()
}

function ilkUrnAddressTostring({ ilk, urnAddress }: { ilk: string; urnAddress: string }): string {
  return `${ilk}-${urnAddress}`
}

export type AppContext = ReturnType<typeof setupAppContext>
