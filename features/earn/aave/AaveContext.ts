import { getAaveAssetsPrices } from 'blockchain/calls/aave/aavePriceOracle'
import { getAaveReserveData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { getGasEstimation$, getOpenProxyStateMachine$ } from 'features/proxyNew/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable, of } from 'rxjs'
import { distinctUntilKeyChanged, shareReplay, switchMap } from 'rxjs/operators'

import { getAaveUserAccountData } from '../../../blockchain/calls/aave/aaveLendingPool'
import { getAaveOracleAssetPriceData } from '../../../blockchain/calls/aave/aavePriceOracle'
import {
  getAaveReserveConfigurationData,
  getAaveUserReserveData,
} from '../../../blockchain/calls/aave/aaveProtocolDataProvider'
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
  aaveSthEthYieldsQuery,
}: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))
  const contextForAddress$ = connectedContext$.pipe(distinctUntilKeyChanged('account'))

  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)
  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const tokenBalances$: Observable<TokenBalances> = contextForAddress$.pipe(
    switchMap(({ account }) => accountBalances$(account)),
  )

  const aaveReserveConfigurationData$ = observe(
    once$,
    context$,
    getAaveReserveConfigurationData,
    ({ token }) => token,
  )

  const aaveUserReserveData$ = observe(once$, connectedContext$, getAaveUserReserveData)

  const aaveOracleAssetPriceData$ = observe(once$, connectedContext$, getAaveOracleAssetPriceData)

  const aaveUserAccountData$ = observe(once$, connectedContext$, getAaveUserAccountData)

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
    aaveOracleAssetPriceData$,
    aaveReserveConfigurationData$,
  )

  const manageAaveStateMachineServices = getManageAavePositionStateMachineServices(
    contextForAddress$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveUserReserveData$,
    aaveUserAccountData$,
    aaveOracleAssetPriceData$,
    aaveReserveConfigurationData$,
    aaveOracleAssetPriceData$,
  )

  const transactionMachine = getOpenAaveTransactionMachine(txHelpers$, contextForAddress$)

  const simulationMachine = getSthEthSimulationMachine(aaveSthEthYieldsQuery)

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

  return {
    aaveStateMachine$,
    aaveManageStateMachine$,
    aaveTotalValueLocked$,
    aaveReserveStEthData$: aaveReserveConfigurationData$({ token: 'STETH' }),
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
