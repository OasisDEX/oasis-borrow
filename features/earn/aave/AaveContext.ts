import { getAaveAssetsPrices } from 'blockchain/calls/aavePriceOracle'
import { getAaveReserveData } from 'blockchain/calls/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { getGasEstimation$, getOpenProxyStateMachine$ } from 'features/proxyNew/pipelines'
import { GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import moment from 'moment'
import { curry } from 'ramda'
import { Observable, of } from 'rxjs'
import { distinctUntilKeyChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { getAaveAssetPriceData } from '../../../blockchain/calls/aavePriceOracle'
import {
  getAaveReserveConfigurationData,
  getAaveUserReserveData,
} from '../../../blockchain/calls/aaveProtocolDataProvider'
import { TokenBalances } from '../../../blockchain/tokens'
import { AppContext } from '../../../components/AppContext'
import { prepareAaveTotalValueLocked$ } from './helpers/aavePrepareAaveTotalValueLocked'
import {
  getClosePositionParametersStateMachine$,
  getClosePositionParametersStateMachineServices$,
  getManageAavePositionStateMachineServices,
  getManageAaveStateMachine$,
} from './manage/services'
import {
  getAaveStEthYield,
  getOpenAaveParametersStateMachineServices$,
  getOpenAavePositionStateMachineServices,
  getOpenAaveTransactionMachine,
  getParametersStateMachine$,
  getSthEthSimulationMachine,
} from './open/services'
import { getOpenAaveStateMachine$ } from './open/services'

export function setupAaveContext({
  userSettings$,
  connectedContext$,
  proxyAddress$,
  txHelpers$,
  gasPrice$,
  daiEthTokenPrice$,
  accountBalances$,
  onEveryBlock$,
  context$,
}: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))
  const contextForAddress$ = connectedContext$.pipe(distinctUntilKeyChanged('account'))

  const graphQLClient$ = contextForAddress$.pipe(
    distinctUntilKeyChanged('cacheApi'),
    map(({ cacheApi }) => new GraphQLClient(cacheApi)),
  )

  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)
  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const tokenBalances$: Observable<TokenBalances> = contextForAddress$.pipe(
    switchMap(({ account }) => accountBalances$(account)),
  )

  const aaveReserveConfigurationData$ = observe(once$, context$, getAaveReserveConfigurationData)

  const aaveUserReserveData$ = observe(once$, connectedContext$, getAaveUserReserveData)

  const aaveAssetPriceData$ = observe(once$, connectedContext$, getAaveAssetPriceData)

  const parametersStateMachineServices$ = getOpenAaveParametersStateMachineServices$(
    contextForAddress$,
    txHelpers$,
    gasEstimation$,
    userSettings$,
  )

  const parametersStateMachine$ = getParametersStateMachine$(parametersStateMachineServices$)

  const closePositionParametersStateMachineServices$ = getClosePositionParametersStateMachineServices$(
    contextForAddress$,
    txHelpers$,
    gasEstimation$,
    userSettings$,
  )
  const closePositionParametersStateMachine$ = getClosePositionParametersStateMachine$(
    closePositionParametersStateMachineServices$,
  )

  const proxyStateMachine$ = getOpenProxyStateMachine$(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )

  const openAaveStateMachineServices = getOpenAavePositionStateMachineServices(
    contextForAddress$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveReserveConfigurationData$,
    aaveAssetPriceData$,
  )

  const manageAaveStateMachineServices = getManageAavePositionStateMachineServices(
    contextForAddress$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveUserReserveData$,
  )

  const transactionMachine = getOpenAaveTransactionMachine(txHelpers$, contextForAddress$)

  const aaveSthEthYields = curry(getAaveStEthYield)(graphQLClient$, moment())

  const simulationMachine = getSthEthSimulationMachine(aaveSthEthYields)

  const aaveStateMachine$ = getOpenAaveStateMachine$(
    openAaveStateMachineServices,
    parametersStateMachine$,
    proxyStateMachine$,
    transactionMachine,
    simulationMachine,
  )

  const aaveManageStateMachine$ = memoize(
    curry(getManageAaveStateMachine$)(
      manageAaveStateMachineServices,
      closePositionParametersStateMachine$,
      transactionMachine,
    ),
    ({ token, address, strategy }) => `${address}-${token}-${strategy}`,
  )

  const getAaveReserveData$ = observe(onEveryBlock$, context$, getAaveReserveData)
  const getAaveAssetsPrices$ = observe(onEveryBlock$, context$, getAaveAssetsPrices)

  const aaveTotalValueLocked$ = curry(prepareAaveTotalValueLocked$)(
    getAaveReserveData$({ token: 'STETH' }),
    getAaveReserveData$({ token: 'ETH' }),
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC', 'STETH'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  const aaveReserveConfigurationData = aaveReserveConfigurationData$({ token: 'STETH' })

  return {
    aaveStateMachine$,
    aaveManageStateMachine$,
    aaveTotalValueLocked$,
    aaveReserveConfigurationData,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
