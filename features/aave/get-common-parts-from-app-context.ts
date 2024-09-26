import type BigNumber from 'bignumber.js'
import { tokenAllowance } from 'blockchain/better-calls/erc20'
import type { ChainlinkSupportedNetworks } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { userDpmProxies$ } from 'blockchain/userDpmProxies'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import type { AccountContext } from 'components/context/AccountContextProvider'
import { getAllowanceStateMachine } from 'features/stateMachines/allowance'
import { getOpenProxyStateMachine } from 'features/stateMachines/proxy/pipelines'
import { GraphQLClient } from 'graphql-request'
import type { MainContext } from 'helpers/context/MainContext.types'
import type { ProductContext } from 'helpers/context/ProductContext.types'
import { makeOneObservable } from 'lendingProtocols/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { distinctUntilKeyChanged, map, switchMap } from 'rxjs/operators'

import { getProxiesRelatedWithPosition$ } from './helpers'
import { getAvailableDPMProxy$, getOperationExecutorTransactionMachine } from './services'
import type { PositionId } from './types'

export function getCommonPartsFromProductContext(
  { connectedContext$, context$, txHelpers$ }: MainContext,
  { proxyAddress$, proxyConsumed$ }: AccountContext,
  {
    gasEstimation$,
    commonTransactionServices,
    dpmAccountStateMachine,
    contextForAddress$,
  }: ProductContext,
  refresh$: Observable<unknown>,
  networkId: ChainlinkSupportedNetworks,
) {
  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const allowanceForAccount$: (token: string, spender: string) => Observable<BigNumber> = memoize(
    (token: string, spender: string) =>
      contextForAddress$.pipe(
        switchMap(({ account }) => tokenAllowance({ token, owner: account, spender, networkId })),
      ),
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

  const getAvailableDPMProxy: (
    walletAddress: string,
    networkId: NetworkIds,
  ) => Observable<UserDpmAccount | undefined> = memoize(
    curry(getAvailableDPMProxy$)(userDpmProxies$, proxyConsumed$),
  )

  const unconsumedDpmProxyForConnectedAccount$ = contextForAddress$.pipe(
    switchMap(({ account }) => getAvailableDPMProxy(account, networkId)),
  )

  const unconsumedDpmForStrategyNetwork = context$.pipe(
    map(({ chainId }) => chainId),
    switchMap((chainId) => {
      if (chainId === networkId) {
        return unconsumedDpmProxyForConnectedAccount$
      }
      return of(undefined)
    }),
  )

  const chainlinkEthUsdOraclePrice = getChainlinkOraclePrice('ETHUSD', networkId)
  const chainLinkETHUSDOraclePrice$ = makeOneObservable(refresh$, () => chainlinkEthUsdOraclePrice)

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
    unconsumedDpmProxyForConnectedAccount$: unconsumedDpmForStrategyNetwork,
    contextForAddress$,
    chainLinkETHUSDOraclePrice$,
  }
}
