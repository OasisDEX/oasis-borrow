import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { TokenBalances } from 'blockchain/tokens'
import { AccountContext } from 'components/context'
import dayjs from 'dayjs'
import { AaveContext } from 'features/aave/aave-context'
import { getCommonPartsFromProductContext } from 'features/aave/get-common-parts-from-app-context'
import {
  getManageAaveStateMachine,
  getManageAaveV2PositionStateMachineServices,
} from 'features/aave/manage/services'
import {
  getOpenAaveStateMachine,
  getOpenAaveV2PositionStateMachineServices,
} from 'features/aave/open/services'
import {
  getAaveSupportedTokenBalances$,
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getDepositBorrowAaveMachine,
  getOpenAaveParametersMachine,
  getStrategyInfo$,
} from 'features/aave/services'
import { getSupportedTokens } from 'features/aave/strategies'
import { IStrategyConfig } from 'features/aave/types'
import { getStopLossTransactionStateMachine } from 'features/stateMachines/stopLoss/getStopLossTransactionStateMachine'
import { createAaveHistory$ } from 'features/vaultHistory/vaultHistory'
import { MainContext } from 'helpers/context/MainContext'
import { ProductContext } from 'helpers/context/ProductContext'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveStEthYield } from 'lendingProtocols/aave-v2/calculations/stEthYield'
import { prepareAaveTotalValueLocked$ } from 'lendingProtocols/aave-v2/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export function setupAaveV2Context(
  mainContext: MainContext,
  accountContext: AccountContext,
  productContext: ProductContext,
): AaveContext {
  const { txHelpers$, onEveryBlock$, context$, connectedContext$, chainContext$ } = mainContext
  const { proxyConsumed$, userSettings$ } = accountContext
  const { tokenPriceUSD$, strategyConfig$, protocols, commonTransactionServices } = productContext

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
  } = getCommonPartsFromProductContext(
    mainContext,
    accountContext,
    productContext,
    onEveryBlock$,
    NetworkIds.MAINNET,
  )

  const {
    aaveLikeUserAccountData$,
    aaveLikeProtocolData$,
    aaveLikeReserveConfigurationData$,
    aaveLikeOracleAssetPriceData$,
    getAaveLikeAssetsPrices$,
    getAaveLikeReserveData$,
  } = protocols[LendingProtocol.AaveV2]

  const aaveEarnYieldsQuery = memoize(
    curry(getAaveStEthYield)(disconnectedGraphQLClient$, dayjs()),
    (riskRatio, fields) => JSON.stringify({ fields, riskRatio: riskRatio.multiple.toString() }),
  )

  const earnCollateralsReserveData = {
    STETH: aaveLikeReserveConfigurationData$({ collateralToken: 'STETH', debtToken: 'ETH' }),
  } as { [key: string]: ReturnType<typeof aaveLikeReserveConfigurationData$> }

  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      aaveLikeOracleAssetPriceData$,
      chainLinkETHUSDOraclePrice$,
      getSupportedTokens(LendingProtocol.AaveV2, NetworkNames.ethereumMainnet),
      NetworkIds.MAINNET,
    ),
  )

  const tokenBalances$: Observable<TokenBalances> = context$.pipe(
    switchMap(({ account }) => {
      return aaveSupportedTokenBalances$(account)
    }),
  )

  const strategyInfo$ = memoize(
    curry(getStrategyInfo$)(aaveLikeOracleAssetPriceData$, aaveLikeReserveConfigurationData$),
    (tokens: IStrategyConfig['tokens']) => `${tokens.deposit}-${tokens.collateral}-${tokens.debt}`,
  )

  const openMultiplyAaveParameters = getOpenAaveParametersMachine(
    txHelpers$,
    gasEstimation$,
    NetworkIds.MAINNET,
  )
  const closeAaveParameters = getCloseAaveParametersMachine(
    txHelpers$,
    gasEstimation$,
    NetworkIds.MAINNET,
  )
  const adjustAaveParameters = getAdjustAaveParametersMachine(
    txHelpers$,
    gasEstimation$,
    NetworkIds.MAINNET,
  )
  const depositBorrowAaveMachine = getDepositBorrowAaveMachine(
    txHelpers$,
    gasEstimation$,
    NetworkIds.MAINNET,
  )

  const openAaveStateMachineServices = getOpenAaveV2PositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveLikeUserAccountData$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    aaveLikeProtocolData$,
    allowanceForAccount$,
    unconsumedDpmProxyForConnectedAccount$,
    proxyConsumed$,
    aaveLikeReserveConfigurationData$,
  )

  const stopLossTransactionStateMachine = getStopLossTransactionStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
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
    aaveLikeProtocolData$,
    allowanceForAccount$,
  )

  const aaveStateMachine = getOpenAaveStateMachine(
    openAaveStateMachineServices,
    openMultiplyAaveParameters,
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
    getAaveLikeReserveData$({ token: 'STETH' }),
    getAaveLikeReserveData$({ token: 'ETH' }),
    getAaveLikeAssetsPrices$({ tokens: ['USDC', 'STETH'] }),
  )

  const aaveHistory$ = memoize(curry(createAaveHistory$)(chainContext$, onEveryBlock$))

  return {
    ...protocols[LendingProtocol.AaveV2],
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
