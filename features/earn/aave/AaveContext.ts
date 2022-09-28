import { getAaveAssetsPrices } from 'blockchain/calls/aavePriceOracle'
import { getAaveReserveData } from 'blockchain/calls/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { getGasEstimation$, getOpenProxyStateMachine$ } from 'features/proxyNew/pipelines'
import { GraphQLClient } from 'graphql-request'
import moment from 'moment'
import { curry } from 'ramda'
import { Observable, of } from 'rxjs'
import { distinctUntilKeyChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { getAaveAssetPriceData } from '../../../blockchain/calls/aavePriceOracle'
import { getAaveReserveConfigurationData } from '../../../blockchain/calls/aaveProtocolDataProvider'
import { TokenBalances } from '../../../blockchain/tokens'
import { AppContext } from '../../../components/AppContext'
import { prepareAaveTotalValueLocked$ } from './helpers/aavePrepareAaveTotalValueLocked'
import { aavePrepareReserveConfigurationData$ } from './helpers/aavePrepareReserveConfigurationData'
import {
  getManageAavePositionStateMachineServices,
  getManageAaveStateMachine$,
  getManageAaveTransactionMachine,
} from './manage/services'
import {
  getAaveStEthYield,
  getOpenAaveParametersStateMachineServices$,
  getOpenAavePositionStateMachineServices,
  getOpenAaveTransactionMachine,
  getParametersStateMachine$,
  getSthEthSimulationMachine,
} from './open/services'
import { getOpenAaveStateMachine$ } from './open/services/getOpenAaveStateMachine'

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

  const aaveReserveConfigurationData$ = observe(
    once$,
    connectedContext$,
    getAaveReserveConfigurationData,
  )

  const aaveAssetPriceData$ = observe(once$, connectedContext$, getAaveAssetPriceData)

  const parametersStateMachineServices$ = getOpenAaveParametersStateMachineServices$(
    contextForAddress$,
    txHelpers$,
    gasEstimation$,
    userSettings$,
  )

  const parametersStateMachine$ = getParametersStateMachine$(parametersStateMachineServices$)

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
  )

  const transactionMachine = getOpenAaveTransactionMachine(txHelpers$, contextForAddress$)
  const manageTransactionMachine = getManageAaveTransactionMachine(txHelpers$, contextForAddress$)

  const aaveSthEthYields = curry(getAaveStEthYield)(graphQLClient$, moment())

  const simulationMachine = getSthEthSimulationMachine(aaveSthEthYields)

  const aaveStateMachine$ = getOpenAaveStateMachine$(
    openAaveStateMachineServices,
    parametersStateMachine$,
    proxyStateMachine$,
    transactionMachine,
    simulationMachine,
  )

  const aaveManageStateMachine$ = getManageAaveStateMachine$(
    manageAaveStateMachineServices,
    parametersStateMachine$,
    manageTransactionMachine,
  )

  const getAaveReserveData$ = observe(onEveryBlock$, context$, getAaveReserveData)
  const getAaveAssetsPrices$ = observe(onEveryBlock$, context$, getAaveAssetsPrices)

  const aaveTotalValueLocked$ = curry(prepareAaveTotalValueLocked$)(
    getAaveReserveData$({ token: 'STETH' }),
    getAaveReserveData$({ token: 'ETH' }),
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC', 'STETH'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  const aaveReserveStEthData$ = curry(aavePrepareReserveConfigurationData$)(
    aaveReserveConfigurationData$({ token: 'STETH' }),
  )

  return {
    aaveStateMachine$,
    aaveManageStateMachine$,
    aaveTotalValueLocked$,
    aaveReserveStEthData$,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
