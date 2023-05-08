import { TokenBalances } from 'blockchain/tokens'
import { AppContext } from 'components/AppContext'
import { getStopLossTransactionStateMachine } from 'features/stateMachines/stopLoss/getStopLossTransactionStateMachine'
import { createAaveHistory$ } from 'features/vaultHistory/vaultHistory'
import { NetworkNames } from 'helpers/networkNames'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveWstEthYield } from 'lendingProtocols/aave-v3/calculations/wstEthYield'
import { prepareAaveTotalValueLocked$ } from 'lendingProtocols/aave-v3/pipelines'
import { ReserveConfigurationData } from 'lendingProtocols/aaveCommon'
import { memoize } from 'lodash'
import moment from 'moment/moment'
import { curry } from 'ramda'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { AaveContext } from './aave-context'
import { IStrategyConfig } from './common'
import {
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getDepositBorrowAaveMachine,
  getOpenDepositBorrowAaveMachine,
  getOpenMultiplyAaveParametersMachine,
} from './common/services/getParametersMachines'
import { getStrategyInfo$ } from './common/services/getStrategyInfo'
import { getCommonPartsFromAppContext } from './get-common-parts-from-app-context'
import {
  getManageAaveStateMachine,
  getManageAaveV2PositionStateMachineServices,
} from './manage/services'
import { getOpenAaveStateMachine, getOpenAaveV3PositionStateMachineServices } from './open/services'
import { getAaveSupportedTokenBalances$ } from './services/getAaveSupportedTokenBalances'
import { getSupportedTokens } from './strategy-config'

export function setupAavev3Context(appContext: AppContext): AaveContext {
  const {
    userSettings$,
    txHelpers$,
    balance$,
    onEveryBlock$,
    context$,
    tokenPriceUSD$,
    proxyConsumed$,
    strategyConfig$,
    protocols,
    connectedContext$,
    commonTransactionServices,
    chainContext$,
  } = appContext

  const {
    allowanceForAccount$,
    allowanceStateMachine,
    dpmAccountStateMachine,
    gasEstimation$,
    operationExecutorTransactionMachine,
    proxyForAccount$,
    proxyStateMachine,
    proxiesRelatedWithPosition$,
    unconsumedDpmProxyForConnectedAccount$,
    disconnectedGraphQLClient$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
  } = getCommonPartsFromAppContext(appContext)

  const {
    aaveUserAccountData$,
    aaveProtocolData$,
    aaveReserveConfigurationData$,
    aaveOracleAssetPriceData$,
    getAaveReserveData$,
    getAaveAssetsPrices$,
  } = protocols[LendingProtocol.AaveV3]

  const aaveEarnYieldsQuery = memoize(
    curry(getAaveWstEthYield)(disconnectedGraphQLClient$, moment()),
    (riskRatio, fields) => JSON.stringify({ fields, riskRatio: riskRatio.multiple.toString() }),
  )

  const earnCollateralsReserveData = {
    WSTETH: aaveReserveConfigurationData$({ token: 'WSTETH' }),
  } as Record<string, Observable<ReserveConfigurationData>>

  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      balance$,
      aaveOracleAssetPriceData$,
      () => of(one), // aave v3 base is already in USD
      getSupportedTokens(LendingProtocol.AaveV3, NetworkNames.ethereumMainnet),
    ),
  )

  const tokenBalances$: Observable<TokenBalances> = context$.pipe(
    switchMap(({ account }) => {
      return aaveSupportedTokenBalances$(account)
    }),
  )

  const strategyInfo$ = memoize(
    curry(getStrategyInfo$)(aaveOracleAssetPriceData$, aaveReserveConfigurationData$),
    (tokens: IStrategyConfig['tokens']) => `${tokens.deposit}-${tokens.collateral}-${tokens.debt}`,
  )

  const openAaveParameters = getOpenMultiplyAaveParametersMachine(txHelpers$, gasEstimation$)
  const closeAaveParameters = getCloseAaveParametersMachine(txHelpers$, gasEstimation$)
  const adjustAaveParameters = getAdjustAaveParametersMachine(txHelpers$, gasEstimation$)
  const depositBorrowAaveMachine = getDepositBorrowAaveMachine(txHelpers$, gasEstimation$)
  const openDepositBorrowAaveMachine = getOpenDepositBorrowAaveMachine(txHelpers$, gasEstimation$)

  const openAaveStateMachineServices = getOpenAaveV3PositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveUserAccountData$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    aaveProtocolData$,
    allowanceForAccount$,
    unconsumedDpmProxyForConnectedAccount$,
    proxyConsumed$,
    aaveReserveConfigurationData$,
  )

  const manageAaveStateMachineServices = getManageAaveV2PositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    proxiesRelatedWithPosition$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    aaveProtocolData$,
    allowanceForAccount$,
  )

  const stopLossTransactionStateMachine = getStopLossTransactionStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const aaveStateMachine = getOpenAaveStateMachine(
    openAaveStateMachineServices,
    openAaveParameters,
    openDepositBorrowAaveMachine,
    proxyStateMachine,
    dpmAccountStateMachine,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
    stopLossTransactionStateMachine,
  )

  const aaveManageStateMachine = getManageAaveStateMachine(
    manageAaveStateMachineServices,
    closeAaveParameters,
    adjustAaveParameters,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
    depositBorrowAaveMachine,
  )

  const aaveTotalValueLocked$ = curry(prepareAaveTotalValueLocked$)(
    getAaveReserveData$({ token: 'WSTETH' }),
    getAaveReserveData$({ token: 'ETH' }),
    getAaveAssetsPrices$({
      tokens: ['ETH', 'WSTETH'],
    }),
  )

  const aaveHistory$ = memoize(curry(createAaveHistory$)(chainContext$, onEveryBlock$))

  return {
    ...protocols[LendingProtocol.AaveV3],
    aaveStateMachine,
    aaveManageStateMachine,
    aaveTotalValueLocked$,
    aaveEarnYieldsQuery,
    strategyConfig$,
    proxiesRelatedWithPosition$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
    earnCollateralsReserveData,
    dpmAccountStateMachine,
    aaveHistory$,
  }
}
