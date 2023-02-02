import BigNumber from 'bignumber.js'
import { GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { distinctUntilKeyChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { getChainlinkOraclePrice } from '../../blockchain/calls/chainlink/chainlinkPriceOracle'
import { observe } from '../../blockchain/calls/observe'
import { UserDpmAccount } from '../../blockchain/userDpmProxies'
import { AppContext } from '../../components/AppContext'
import { getAllowanceStateMachine } from '../stateMachines/allowance'
import {
  getCreateDPMAccountTransactionMachine,
  getDPMAccountStateMachine,
} from '../stateMachines/dpmAccount'
import { getGasEstimation$, getOpenProxyStateMachine } from '../stateMachines/proxy/pipelines'
import { transactionContextService } from '../stateMachines/transaction'
import { getAvailableDPMProxy$ } from './common/services/getAvailableDPMProxy'
import { getOperationExecutorTransactionMachine } from './common/services/getTransactionMachine'
import { getProxiesRelatedWithPosition$ } from './helpers/getProxiesRelatedWithPosition'
import { PositionId } from './types'

export function getCommonPartsFromAppContext({
  onEveryBlock$,
  connectedContext$,
  context$,
  gasPrice$,
  daiEthTokenPrice$,
  proxyAddress$,
  userDpmProxy$,
  allowance$,
  txHelpers$,
  proxyConsumed$,
  userDpmProxies$,
}: AppContext) {
  const contextForAddress$ = connectedContext$.pipe(
    distinctUntilKeyChanged('account'),
    shareReplay(1),
  )
  const disconnectedGraphQLClient$ = context$.pipe(
    distinctUntilKeyChanged('cacheApi'),
    map(({ cacheApi }) => new GraphQLClient(cacheApi)),
  )

  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$, userDpmProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const allowanceForAccount$: (token: string, spender: string) => Observable<BigNumber> = memoize(
    (token: string, spender: string) =>
      contextForAddress$.pipe(switchMap(({ account }) => allowance$(token, account, spender))),
    (token, spender) => `${token}-${spender}`,
  )

  const commonTransactionServices = transactionContextService(context$)

  const allowanceStateMachine = getAllowanceStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const proxyStateMachine = getOpenProxyStateMachine(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )

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

  const operationExecutorTransactionMachine = curry(getOperationExecutorTransactionMachine)(
    txHelpers$,
    contextForAddress$,
    commonTransactionServices,
  )

  const getAvailableDPMProxy: (
    walletAddress: string,
  ) => Observable<UserDpmAccount | undefined> = memoize(
    curry(getAvailableDPMProxy$)(userDpmProxies$, proxyConsumed$),
  )

  const unconsumedDpmProxyForConnectedAccount$ = contextForAddress$.pipe(
    switchMap(({ account }) => getAvailableDPMProxy(account)),
  )

  const chainlinkUSDCUSDOraclePrice$ = memoize(
    observe(onEveryBlock$, context$, getChainlinkOraclePrice('USDCUSD'), () => 'true'),
  )

  const chainLinkETHUSDOraclePrice$ = memoize(
    observe(onEveryBlock$, context$, getChainlinkOraclePrice('ETHUSD'), () => 'true'),
  )

  return {
    allowanceForAccount$,
    allowanceStateMachine,
    commonTransactionServices,
    dpmAccountStateMachine,
    gasEstimation$,
    getAvailableDPMProxy,
    operationExecutorTransactionMachine,
    proxyForAccount$,
    proxyStateMachine,
    proxiesRelatedWithPosition$,
    unconsumedDpmProxyForConnectedAccount$,
    contextForAddress$,
    disconnectedGraphQLClient$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
  }
}
