import BigNumber from 'bignumber.js'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { observe } from 'blockchain/calls/observe'
import { getNetworkContracts } from 'blockchain/contracts'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { AppContext } from 'components/AppContext'
import { getAllowanceStateMachine } from 'features/stateMachines/allowance'
import { getOpenProxyStateMachine } from 'features/stateMachines/proxy/pipelines'
import { GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { distinctUntilKeyChanged, map, switchMap } from 'rxjs/operators'

import { getAvailableDPMProxy$ } from './common/services/getAvailableDPMProxy'
import { getOperationExecutorTransactionMachine } from './common/services/getTransactionMachine'
import { getProxiesRelatedWithPosition$ } from './helpers'
import { PositionId } from './types'

export function getCommonPartsFromAppContext({
  onEveryBlock$,
  connectedContext$,
  context$,
  gasEstimation$,
  proxyAddress$,
  userDpmProxy$,
  allowance$,
  txHelpers$,
  proxyConsumed$,
  userDpmProxies$,
  commonTransactionServices,
  dpmAccountStateMachine,
  contextForAddress$,
}: AppContext) {
  const disconnectedGraphQLClient$ = context$.pipe(
    distinctUntilKeyChanged('chainId'),
    map(({ chainId }) => new GraphQLClient(getNetworkContracts(chainId).cacheApi)),
  )

  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$, userDpmProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const allowanceForAccount$: (token: string, spender: string) => Observable<BigNumber> = memoize(
    (token: string, spender: string) =>
      contextForAddress$.pipe(switchMap(({ account }) => allowance$(token, account, spender))),
    (token, spender) => `${token}-${spender}`,
  )

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

  const operationExecutorTransactionMachine = curry(getOperationExecutorTransactionMachine)(
    txHelpers$,
    contextForAddress$,
    commonTransactionServices,
  )

  const getAvailableDPMProxy: (walletAddress: string) => Observable<UserDpmAccount | undefined> =
    memoize(curry(getAvailableDPMProxy$)(userDpmProxies$, proxyConsumed$))

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
