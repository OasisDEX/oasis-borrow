import { NetworkNames, networksByName } from 'blockchain/networks'
import { ensureIsSupportedSparkV3NetworkId } from 'blockchain/spark-v3'
import { TokenBalances } from 'blockchain/tokens'
import { getUserDpmProxy } from 'blockchain/userDpmProxies'
import { AccountContext } from 'components/context'
import dayjs from 'dayjs'
import { AaveContext } from 'features/aave/aave-context'
import { getCommonPartsFromProductContext } from 'features/aave/get-common-parts-from-app-context'
import { getAaveV3StrategyConfig, ProxiesRelatedWithPosition } from 'features/aave/helpers'
import {
  getManageAaveStateMachine,
  getManageAaveV3PositionStateMachineServices,
} from 'features/aave/manage/services'
import {
  getOpenAaveStateMachine,
  getOpenAaveV3PositionStateMachineServices,
} from 'features/aave/open/services'
import {
  getAaveHistoryEvents,
  getAaveSupportedTokenBalances$,
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getDepositBorrowAaveMachine,
  getOpenAaveParametersMachine,
  getStrategyInfo$,
} from 'features/aave/services'
import { getSupportedTokens } from 'features/aave/strategies'
import { IStrategyConfig, PositionId } from 'features/aave/types'
import { VaultType } from 'features/generalManageVault/vaultType'
import { getStopLossTransactionStateMachine } from 'features/stateMachines/stopLoss/getStopLossTransactionStateMachine'
import { createAaveHistory$ } from 'features/vaultHistory/vaultHistory'
import { MainContext } from 'helpers/context/MainContext'
import { ProductContext } from 'helpers/context/ProductContext'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { AaveLikeReserveConfigurationData } from 'lendingProtocols/aave-like-common'
import { getAaveWstEthYield } from 'lendingProtocols/aave-v3/calculations/wstEthYield'
import { prepareAaveTotalValueLocked$ } from 'lendingProtocols/aave-v3/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { merge, Observable, of, Subject } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'

export type StrategyUpdateParams = {
  positionId: PositionId
  networkName: NetworkNames
  vaultType?: VaultType
}

export function setupSparkV3Context(
  mainContext: MainContext,
  accountContext: AccountContext,
  productContext: ProductContext,
  network: NetworkNames,
): AaveContext {
  const networkId = networksByName[network].id

  ensureIsSupportedSparkV3NetworkId(networkId)

  const { txHelpers$, onEveryBlock$, context$, connectedContext$, chainContext$ } = mainContext
  const { userSettings$, proxyConsumed$ } = accountContext
  const { tokenPriceUSD$, protocols, commonTransactionServices } = productContext

  const {
    allowanceForAccount$,
    allowanceStateMachine,
    dpmAccountStateMachine,
    gasEstimation$,
    operationExecutorTransactionMachine,
    proxyForAccount$,
    proxyStateMachine,
    unconsumedDpmProxyForConnectedAccount$,
    disconnectedGraphQLClient$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
  } = getCommonPartsFromProductContext(
    mainContext,
    accountContext,
    productContext,
    onEveryBlock$,
    networkId,
  )

  const userDpms = memoize(getUserDpmProxy, (vaultId, chainId) => `${vaultId}-${chainId}`)
  const proxiesRelatedWithPosition$: (
    positionId: PositionId,
  ) => Observable<ProxiesRelatedWithPosition> = memoize(
    (positionId) => {
      return of(undefined).pipe(
        switchMap(async () => {
          const dpm = await userDpms(positionId.vaultId!, networkId)

          return {
            dsProxy: undefined,
            dpmProxy: dpm,
            walletAddress: (dpm?.user || positionId.walletAddress)!,
          }
        }),
      )
    },
    (positionId) => JSON.stringify(positionId),
  )

  const {
    aaveLikeUserAccountData$,
    aaveLikeProtocolData$,
    aaveLikeReserveConfigurationData$,
    aaveLikeOracleAssetPriceData$,
    getAaveLikeReserveData$,
    getAaveLikeAssetsPrices$,
  } = protocols[LendingProtocol.SparkV3][networkId]

  const aaveEarnYieldsQuery = memoize(
    curry(getAaveWstEthYield)(disconnectedGraphQLClient$, dayjs()),
    (riskRatio, fields) => JSON.stringify({ fields, riskRatio: riskRatio.multiple.toString() }),
  )

  const earnCollateralsReserveData = {
    WSTETH: aaveLikeReserveConfigurationData$({ collateralToken: 'WSTETH', debtToken: 'ETH' }),
  } as { [key: string]: Observable<AaveLikeReserveConfigurationData> }

  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      aaveLikeOracleAssetPriceData$,
      of(one), // aave v3 base is already in USD
      getSupportedTokens(LendingProtocol.SparkV3, network),
      networkId,
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

  const openAaveParameters = getOpenAaveParametersMachine(txHelpers$, gasEstimation$, networkId)
  const closeAaveParameters = getCloseAaveParametersMachine(txHelpers$, gasEstimation$, networkId)
  const adjustAaveParameters = getAdjustAaveParametersMachine(txHelpers$, gasEstimation$, networkId)
  const depositBorrowAaveMachine = getDepositBorrowAaveMachine(
    txHelpers$,
    gasEstimation$,
    networkId,
  )

  const openAaveStateMachineServices = getOpenAaveV3PositionStateMachineServices(
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

  const manageAaveStateMachineServices = getManageAaveV3PositionStateMachineServices(
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
    getAaveHistoryEvents,
  )

  const stopLossTransactionStateMachine = getStopLossTransactionStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const aaveStateMachine = getOpenAaveStateMachine(
    openAaveStateMachineServices,
    openAaveParameters,
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
    getAaveLikeReserveData$({ token: 'WSTETH' }),
    getAaveLikeReserveData$({ token: 'ETH' }),
    getAaveLikeAssetsPrices$({
      tokens: ['ETH', 'WSTETH'],
    }),
  )

  const aaveHistory$ = memoize(curry(createAaveHistory$)(chainContext$, onEveryBlock$))

  const strategyUpdateTrigger = new Subject<StrategyUpdateParams>()
  const strategyConfig$: (
    positionId: PositionId,
    networkName: NetworkNames,
    vaultType?: VaultType,
  ) => Observable<IStrategyConfig> = memoize(
    (positionId: PositionId, networkName: NetworkNames, vaultType) =>
      merge(
        // Subsequent updates from within x-state
        strategyUpdateTrigger.pipe(
          filter(
            (params) => params.positionId === positionId && params.networkName === networkName,
          ),
        ),
        // The initial trigger from WithAaveStrategy
        of({ positionId, networkName, vaultType }),
      ).pipe(
        switchMap((params) =>
          getAaveV3StrategyConfig(params.positionId, params.networkName, params.vaultType),
        ),
      ),
    (positionId, networkName, vaultType) => JSON.stringify({ positionId, networkName, vaultType }),
  )

  function updateStrategyConfig(positionId: PositionId, networkName: NetworkNames) {
    return (vaultType: VaultType) => {
      strategyUpdateTrigger.next({
        positionId,
        networkName,
        vaultType,
      })
    }
  }

  return {
    ...protocols[LendingProtocol.SparkV3][networkId],
    aaveStateMachine,
    aaveManageStateMachine,
    aaveTotalValueLocked$,
    aaveEarnYieldsQuery,
    strategyConfig$,
    updateStrategyConfig,
    proxiesRelatedWithPosition$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
    earnCollateralsReserveData,
    dpmAccountStateMachine,
    aaveHistory$,
  }
}
