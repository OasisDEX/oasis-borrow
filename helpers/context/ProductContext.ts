import { BigNumber } from 'bignumber.js'
import { tokenAllowance as tokenAllowanceEthers } from 'blockchain/better-calls/erc20'
import { skyUsdsStakeDetails, skyUsdsWalletStakeDetails } from 'blockchain/better-calls/sky'
import { call } from 'blockchain/calls/callsHelpers'
import { dogIlk } from 'blockchain/calls/dog'
import { tokenAllowance } from 'blockchain/calls/erc20'
import { jugIlk } from 'blockchain/calls/jug'
import { observe } from 'blockchain/calls/observe'
import { proxyActionsAdapterResolver$ } from 'blockchain/calls/proxyActions/proxyActionsAdapterResolver'
import { spotIlk } from 'blockchain/calls/spot'
import { vatIlk } from 'blockchain/calls/vat'
import { getCollateralLocked$, getTotalValueLocked$ } from 'blockchain/collateral'
import { createIlkData$, createIlkDataList$, createIlksSupportedOnNetwork$ } from 'blockchain/ilks'
import { every10Seconds$ } from 'blockchain/network.constants'
import type { NetworkNames } from 'blockchain/networks'
import { NetworkIds } from 'blockchain/networks'
import { createTokenPriceInUSD$ } from 'blockchain/prices'
import { tokenPrices$ } from 'blockchain/prices.constants'
import { createAllowance$, createBalanceFromAddress$ } from 'blockchain/tokens'
import { getPositionIdFromDpmProxy$ } from 'blockchain/userDpmProxies'
import type { AccountContext } from 'components/context/AccountContextProvider'
import { pluginDevModeHelpers } from 'components/devModeHelpers'
import dayjs from 'dayjs'
import { getProxiesRelatedWithPosition$ } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import { getStrategyConfig$ } from 'features/aave/helpers/getStrategyConfig'
import { readPositionCreatedEvents$ } from 'features/aave/services'
import type { PositionId } from 'features/aave/types/position-id'
import { createAutomationTriggersData } from 'features/automation/api/automationTriggersData'
import { MULTIPLY_VAULT_PILL_CHANGE_SUBJECT } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange.constants'
import type { MultiplyPillChange } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange.types'
import { createOpenVault$ } from 'features/borrow/open/pipes/openVault'
import { createDaiDeposit$ } from 'features/dsr/helpers/daiDeposit'
import { createDsrDeposit$ } from 'features/dsr/helpers/dsrDeposit'
import { createDsrHistory$ } from 'features/dsr/helpers/dsrHistory'
import { chi, dsr, Pie, pie } from 'features/dsr/helpers/potCalls'
import { createDsr$ } from 'features/dsr/utils/createDsr'
import { createProxyAddress$ as createDsrProxyAddress$ } from 'features/dsr/utils/proxy'
import {
  getTotalSupply,
  getUnderlyingBalances,
} from 'features/earn/guni/manage/pipes/guniActionsCalls'
import { createManageGuniVault$ } from 'features/earn/guni/manage/pipes/manageGuniVault'
import { getGuniMintAmount, getToken1Balance } from 'features/earn/guni/open/pipes/guniActionsCalls'
import { createOpenGuniVault$ } from 'features/earn/guni/open/pipes/openGuniVault'
import {
  createMakerOracleTokenPrices$,
  createMakerOracleTokenPricesForDates$,
} from 'features/earn/makerOracleTokenPrices'
import type { ExchangeAction, ExchangeType } from 'features/exchange/exchange'
import { createExchangeQuote$ } from 'features/exchange/exchange'
import { createGeneralManageVault$ } from 'features/generalManageVault/generalManageVault'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import { createManageMultiplyVault$ } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createOpenMultiplyVault$ } from 'features/multiply/open/pipes/openMultiplyVault'
import { createVaultsNotices$ } from 'features/notices/vaultsNotices'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { getDpmPositionDataV2$ } from 'features/omni-kit/observables'
import { getAaveLikePosition$ } from 'features/omni-kit/protocols/aave-like/observables'
import { getAjnaPosition$ } from 'features/omni-kit/protocols/ajna/observables'
import { getErc4626Position$ } from 'features/omni-kit/protocols/erc-4626/observables'
import type { Erc4626Token } from 'features/omni-kit/protocols/erc-4626/types'
import { getMorphoPosition$ } from 'features/omni-kit/protocols/morpho-blue/observables'
import type { OmniTokensPrecision } from 'features/omni-kit/types'
import { createReclaimCollateral$ } from 'features/reclaimCollateral/reclaimCollateral'
import {
  createBalanceInfo$,
  createBalancesArrayInfo$,
  createBalancesFromAddressArrayInfo$,
} from 'features/shared/balanceInfo'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import { createCheckOasisCDPType$ } from 'features/shared/checkOasisCDPType'
import { createPriceInfo$ } from 'features/shared/priceInfo'
import { checkVaultTypeUsingApi$, saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { getAllowanceStateMachine } from 'features/stateMachines/allowance'
import {
  getCreateDPMAccountTransactionMachine,
  getDPMAccountStateMachine,
} from 'features/stateMachines/dpmAccount'
import { getGasEstimation$ } from 'features/stateMachines/proxy/pipelines'
import { transactionContextService } from 'features/stateMachines/transaction'
import { createVaultHistory$ } from 'features/vaultHistory/vaultHistory'
import { bigNumberTostring } from 'helpers/bigNumberToString'
import { getYieldChange$, getYields$ } from 'helpers/earn/calculations'
import { doGasEstimation } from 'helpers/form'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { uiChanges } from 'helpers/uiChanges'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveV2Services } from 'lendingProtocols/aave-v2'
import { getAaveV3Services } from 'lendingProtocols/aave-v3'
import { getSparkV3Services } from 'lendingProtocols/spark-v3'
import { memoize } from 'lodash'
import { equals } from 'ramda'
import type { Observable } from 'rxjs'
import { combineLatest, defer, of } from 'rxjs'
import { fromPromise } from 'rxjs/internal-compatibility'
import { distinctUntilKeyChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import type { MainContext } from './MainContext.types'
import type { TxHelpers } from './TxHelpers'
import type { ProtocolsServices } from './types'
import curry from 'ramda/src/curry'

export function setupProductContext(
  {
    chainContext$,
    connectedContext$,
    context$,
    everyBlock$,
    gasPriceOnNetwork$,
    once$,
    onEveryBlock$,
    txHelpers$,
  }: MainContext,
  {
    balance$,
    cdpManagerIlks$,
    ilkData$,
    ilkToToken$,
    oraclePriceData$,
    proxyAddress$,
    userSettings$,
    vault$,
  }: AccountContext,
) {
  console.info('Product context setup')

  const tokenPriceUSD$ = memoize(
    curry(createTokenPriceInUSD$)(every10Seconds$, tokenPrices$),
    (tokens: string[]) => tokens.sort((a, b) => a.localeCompare(b)).join(','),
  )
  const tokenPriceUSDStatic$ = memoize(
    curry(createTokenPriceInUSD$)(once$, tokenPrices$),
    (tokens: string[]) => tokens.sort((a, b) => a.localeCompare(b)).join(','),
  )

  const daiEthTokenPrice$ = tokenPriceUSD$(['DAI', 'ETH'])

  function addGasEstimation$<S extends HasGasEstimation>(
    // only mainnet here
    state: S,
    call: (send: TxHelpers, state: S) => Observable<number> | undefined,
  ): Observable<S> {
    return doGasEstimation(
      gasPriceOnNetwork$(NetworkIds.MAINNET),
      daiEthTokenPrice$,
      txHelpers$,
      state,
      call,
    )
  }

  // protocols
  const aaveV2Services = getAaveV2Services({
    refresh$: onEveryBlock$,
  })

  const aaveV3Services = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.MAINNET,
  })
  const aaveV3OptimismServices = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.OPTIMISMMAINNET,
  })
  const aaveV3ArbitrumServices = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.ARBITRUMMAINNET,
  })
  const aaveV3BaseServices = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.BASEMAINNET,
  })
  const sparkV3Services = getSparkV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.MAINNET,
  })

  // base

  const vatIlksLean$ = observe(once$, chainContext$, vatIlk)
  const spotIlksLean$ = observe(once$, chainContext$, spotIlk)
  const jugIlksLean$ = observe(once$, chainContext$, jugIlk)
  const dogIlksLean$ = observe(once$, chainContext$, dogIlk)

  const balanceFromAddress$ = memoize(
    curry(createBalanceFromAddress$)(onEveryBlock$, chainContext$),
    (token, address, networkId) => `${token.address}_${token.precision}_${address}_${networkId}`,
  )

  const positionIdFromDpmProxy$ = memoize(
    curry(getPositionIdFromDpmProxy$)(context$),
    (dpmProxy) => dpmProxy,
  )

  const tokenAllowance$ = observe(onEveryBlock$, context$, tokenAllowance)

  const allowance$ = curry(createAllowance$)(context$, tokenAllowance$)

  const ilkDataLean$ = memoize(
    curry(createIlkData$)(vatIlksLean$, spotIlksLean$, jugIlksLean$, dogIlksLean$, ilkToToken$),
  )

  const potDsr$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, dsr)()))
    }),
  )
  const potChi$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, chi)()))
    }),
  )

  const potBigPie$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, Pie)()))
    }),
  )

  const potTotalValueLocked$ = combineLatest(potChi$, potBigPie$).pipe(
    switchMap(([chi, potBigPie]) =>
      of(potBigPie.div(new BigNumber(10).pow(18)).times(chi.div(new BigNumber(10).pow(27)))),
    ),
    shareReplay(1),
  )

  const proxyAddressDsrObservable$ = memoize(
    (addressFromUrl: string) =>
      context$.pipe(
        switchMap((context) => everyBlock$(createDsrProxyAddress$(context, addressFromUrl))),
        shareReplay(1),
      ),
    (item) => item,
  )

  const dsrHistory$ = memoize(
    (addressFromUrl: string) =>
      combineLatest(context$, proxyAddressDsrObservable$(addressFromUrl), onEveryBlock$).pipe(
        switchMap(([context, proxyAddress, _]) => {
          return proxyAddress ? defer(() => createDsrHistory$(context, proxyAddress)) : of([])
        }),
      ),
    (item) => item,
  )

  // TODO: Lines 737 to 773, think we are needing to modify this to use different context, lots of repeated code
  const dsr$ = memoize(
    (addressFromUrl: string) =>
      createDsr$(
        context$,
        everyBlock$,
        onEveryBlock$,
        dsrHistory$(addressFromUrl),
        potDsr$,
        potChi$,
        addressFromUrl,
      ),
    (item) => item,
  )

  const potPie$ = memoize(
    (addressFromUrl: string) =>
      combineLatest(context$, proxyAddressDsrObservable$(addressFromUrl)).pipe(
        switchMap(([context, proxyAddress]) => {
          if (!proxyAddress) return of(zero)
          return everyBlock$(
            defer(() => call(context, pie)(proxyAddress)),
            equals,
          )
        }),
      ),
    (item) => item,
  )

  const daiDeposit$ = memoize(
    (addressFromUrl: string) => createDaiDeposit$(potPie$(addressFromUrl), potChi$),
    (item) => item,
  )

  const dsrDeposit$ = memoize(
    (addressFromUrl: string) =>
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddressDsrObservable$(addressFromUrl),
        allowance$,
        balancesInfoArray$(['DAI', 'SDAI'], addressFromUrl),
        daiDeposit$(addressFromUrl),
        potDsr$,
        dsr$(addressFromUrl),
        addGasEstimation$,
        addressFromUrl,
      ),
    (item) => item,
  )

  const vaultHistory$ = memoize(curry(createVaultHistory$)(chainContext$, onEveryBlock$, vault$))

  pluginDevModeHelpers(txHelpers$, connectedContext$, proxyAddress$)

  const ilksSupportedOnNetwork$ = createIlksSupportedOnNetwork$(chainContext$)

  const ilkDataList$ = createIlkDataList$(ilkDataLean$, ilksSupportedOnNetwork$)

  const priceInfo$ = curry(createPriceInfo$)(oraclePriceData$)

  // TODO Don't allow undefined args like this
  const balanceInfo$ = curry(createBalanceInfo$)(balance$) as (
    token: string,
    account: string | undefined,
  ) => Observable<BalanceInfo>

  const balancesInfoArray$ = curry(createBalancesArrayInfo$)(balance$)
  const balancesFromAddressInfoArray$ = curry(createBalancesFromAddressArrayInfo$)(
    balanceFromAddress$,
  )

  const openVault$ = memoize((ilk: string) =>
    createOpenVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      ilkToToken$,
      addGasEstimation$,
      proxyActionsAdapterResolver$,
      ilk,
    ),
  )

  const exchangeQuote$ = memoize(
    (
      token: string,
      slippage: BigNumber,
      amount: BigNumber,
      action: ExchangeAction,
      exchangeType: ExchangeType,
      quoteToken?: string,
    ) =>
      createExchangeQuote$(
        context$,
        undefined,
        token,
        slippage,
        amount,
        action,
        exchangeType,
        quoteToken,
      ),
    (token: string, slippage: BigNumber, amount: BigNumber, action: string, exchangeType: string) =>
      `${token}_${slippage.toString()}_${amount.toString()}_${action}_${exchangeType}`,
  )

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const strategyConfig$ = memoize(
    curry(getStrategyConfig$)(
      proxiesRelatedWithPosition$,
      aaveV2Services.aaveLikeProxyConfiguration$,
      readPositionCreatedEvents$,
    ),
    (positionId: PositionId, networkName: NetworkNames) =>
      `${positionId.walletAddress}-${positionId.vaultId}-${networkName}`,
  )

  const automationTriggersData$ = memoize(
    curry(createAutomationTriggersData)(chainContext$, onEveryBlock$, proxiesRelatedWithPosition$),
  )

  const openMultiplyVault$ = memoize((ilk: string) =>
    createOpenMultiplyVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      exchangeQuote$,
      addGasEstimation$,
      userSettings$,
      ilk,
    ),
  )

  const token1Balance$ = observe(onEveryBlock$, context$, getToken1Balance)
  const getGuniMintAmount$ = observe(onEveryBlock$, context$, getGuniMintAmount)

  const manageMultiplyVault$ = memoize(
    (id: BigNumber, vaultType: VaultType) =>
      createManageMultiplyVault$(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        exchangeQuote$,
        addGasEstimation$,
        userSettings$,
        vaultHistory$,
        saveVaultUsingApi$,
        automationTriggersData$,
        vaultType,
        id,
      ),
    bigNumberTostring,
  )

  const getGuniPoolBalances$ = observe(onEveryBlock$, context$, getUnderlyingBalances)

  const getTotalSupply$ = observe(onEveryBlock$, context$, getTotalSupply)

  function getProportions$(gUniBalance: BigNumber, token: string) {
    return combineLatest(getGuniPoolBalances$({ token }), getTotalSupply$({ token })).pipe(
      map(([{ amount0, amount1 }, totalSupply]) => {
        return {
          sharedAmount0: amount0.times(gUniBalance).div(totalSupply),
          sharedAmount1: amount1.times(gUniBalance).div(totalSupply),
        }
      }),
    )
  }

  const manageGuniVault$ = memoize(
    (id: BigNumber) =>
      createManageGuniVault$(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        exchangeQuote$,
        addGasEstimation$,
        getProportions$,
        vaultHistory$,
        makerOracleTokenPrices$,
        id,
      ),
    bigNumberTostring,
  )

  const checkOasisCDPType$: ({
    id,
    protocol,
    owner,
  }: {
    id: BigNumber
    protocol: string
    owner: string
  }) => Observable<VaultType> = curry(createCheckOasisCDPType$)(
    curry(checkVaultTypeUsingApi$)(
      context$,
      uiChanges.subscribe<MultiplyPillChange>(MULTIPLY_VAULT_PILL_CHANGE_SUBJECT),
    ),
    cdpManagerIlks$,
  )

  const generalManageVault$ = memoize(
    curry(createGeneralManageVault$)(
      manageMultiplyVault$,
      manageGuniVault$,
      checkOasisCDPType$,
      vault$,
    ),
    bigNumberTostring,
  )

  const vaultBanners$ = memoize(
    curry(createVaultsNotices$)(context$, priceInfo$, vault$, vaultHistory$),
    bigNumberTostring,
  )

  const reclaimCollateral$ = memoize(
    curry(createReclaimCollateral$)(context$, txHelpers$, proxyAddress$),
    bigNumberTostring,
  )

  const makerOracleTokenPrices$ = memoize(
    curry(createMakerOracleTokenPrices$)(chainContext$),
    (token: string, timestamp: dayjs.Dayjs) => {
      return `${token}-${timestamp.format('YYYY-MM-DD HH:mm')}`
    },
  )

  const makerOracleTokenPricesForDates$ = memoize(
    curry(createMakerOracleTokenPricesForDates$)(chainContext$),
    (token: string, timestamps: dayjs.Dayjs[]) => {
      return `${token}-${timestamps.map((t) => t.format('YYYY-MM-DD HH:mm')).join(' ')}`
    },
  )

  const yields$ = memoize(
    (ilk: string, date?: dayjs.Dayjs) => {
      return getYields$(makerOracleTokenPricesForDates$, ilkData$, ilk, date)
    },
    (ilk: string, date: dayjs.Dayjs = dayjs()) => `${ilk}-${date.format('YYYY-MM-DD')}`,
  )

  const yieldsChange$ = memoize(
    curry(getYieldChange$)(yields$),
    (currentDate: dayjs.Dayjs, previousDate: dayjs.Dayjs, ilk: string) =>
      `${ilk}_${currentDate.format('YYYY-MM-DD')}_${previousDate.format('YYYY-MM-DD')}`,
  )

  const collateralLocked$ = memoize(
    curry(getCollateralLocked$)(connectedContext$, ilkToToken$, balance$),
  )

  const totalValueLocked$ = memoize(
    curry(getTotalValueLocked$)(collateralLocked$, oraclePriceData$),
  )

  const openGuniVault$ = memoize((ilk: string) =>
    createOpenGuniVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      exchangeQuote$,
      onEveryBlock$,
      addGasEstimation$,
      ilk,
      token1Balance$,
      getGuniMintAmount$,
      userSettings$,
    ),
  )

  const protocols: ProtocolsServices = {
    [LendingProtocol.AaveV2]: aaveV2Services,
    [LendingProtocol.AaveV3]: {
      [NetworkIds.MAINNET]: aaveV3Services,
      [NetworkIds.OPTIMISMMAINNET]: aaveV3OptimismServices,
      [NetworkIds.ARBITRUMMAINNET]: aaveV3ArbitrumServices,
      [NetworkIds.BASEMAINNET]: aaveV3BaseServices,
    },
    [LendingProtocol.SparkV3]: {
      [NetworkIds.MAINNET]: sparkV3Services,
    },
  }

  const contextForAddress$ = connectedContext$.pipe(
    distinctUntilKeyChanged('account'),
    shareReplay(1),
  )

  const gasEstimation$ = curry(getGasEstimation$)(context$, gasPriceOnNetwork$, daiEthTokenPrice$)

  const commonTransactionServices = transactionContextService(context$)

  const dpmAccountTransactionMachine = getCreateDPMAccountTransactionMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const dpmAccountStateMachine = getDPMAccountStateMachine(
    context$,
    txHelpers$,
    gasEstimation$,
    dpmAccountTransactionMachine,
  )

  const allowanceStateMachine = getAllowanceStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const allowanceForAccount$: (token: string, spender: string) => Observable<BigNumber> = memoize(
    (token: string, spender: string) =>
      contextForAddress$.pipe(switchMap(({ account }) => allowance$(token, account, spender))),
    (token, spender) => `${token}-${spender}`,
  )

  // temporary to not block ajna, it should be used globally instead of aave version allowanceForAccount$
  const allowanceForAccountEthers$: (
    token: string,
    spender: string,
    networkId: NetworkIds,
  ) => Observable<BigNumber> = memoize(
    (token: string, spender: string, networkId: NetworkIds) =>
      contextForAddress$.pipe(
        switchMap(({ account }) =>
          tokenAllowanceEthers({ token, owner: account, spender, networkId }),
        ),
      ),
    (token, spender, networkId) => `${token}-${spender}-${networkId}`,
  )

  // v2 because it takes into account all positions created using specific proxies and filter them
  // out based on params from URL i.e. 2x positions with id 950 but on different pools, based on URL params
  // only single position should be picked to be displayed
  const dpmPositionDataV2$ = memoize(
    curry(getDpmPositionDataV2$),
    (
      positionId: number,
      networkId: NetworkIds,
      collateralToken: string,
      quoteToken: string,
      product: string,
      protocol: LendingProtocol,
      protocolRaw: string,
      pairId: number,
    ) =>
      `${positionId}-${networkId}-${collateralToken}-${quoteToken}-${product}-${protocol}-${protocolRaw}-${pairId}`,
  )

  const ajnaPosition$ = memoize(
    curry(getAjnaPosition$)(onEveryBlock$),
    (
      collateralPrice: BigNumber,
      quotePrice: BigNumber,
      dpmPositionData: DpmPositionData,
      network: NetworkIds,
      collateralAddress?: string,
      quoteAddress?: string,
    ) =>
      `${dpmPositionData.vaultId}-${network}-${collateralPrice
        .decimalPlaces(2)
        .toString()}-${quotePrice
        .decimalPlaces(2)
        .toString()}-${collateralAddress}-${quoteAddress}`,
  )

  const morphoPosition$ = memoize(
    curry(getMorphoPosition$)(onEveryBlock$),
    (
      collateralPrice: BigNumber,
      quotePrice: BigNumber,
      dpmPositionData: DpmPositionData,
      pairId: number,
      network: NetworkIds,
      tokensPrecision?: OmniTokensPrecision,
    ) =>
      `${dpmPositionData.vaultId}-${pairId}-${network}-${collateralPrice
        .decimalPlaces(2)
        .toString()}-${quotePrice.decimalPlaces(2).toString()}-${Object.values(
        tokensPrecision ?? {},
      ).join('-')}`,
  )

  const erc4626Position$ = memoize(
    curry(getErc4626Position$)(onEveryBlock$),
    (
      quotePrice: BigNumber,
      vaultAddress: string,
      dpmPositionData: DpmPositionData,
      token: Erc4626Token,
      network: NetworkIds,
    ) =>
      `${dpmPositionData.vaultId}-${network}-${vaultAddress}-${JSON.stringify(token)}-${quotePrice
        .decimalPlaces(2)
        .toString()}`,
  )

  const aaveLikePosition$ = memoize(
    curry(getAaveLikePosition$)(onEveryBlock$),
    (
      collateralPrice: BigNumber,
      quotePrice: BigNumber,
      dpmPositionData: DpmPositionData,
      network: NetworkIds,
    ) =>
      `${dpmPositionData.vaultId}-${network}-${collateralPrice
        .decimalPlaces(2)
        .toString()}-${quotePrice.decimalPlaces(2).toString()}`,
  )

  const skyUsdsWalletStakeDetails$ = (ownerAddress?: string) =>
    onEveryBlock$.pipe(() => fromPromise(skyUsdsWalletStakeDetails({ ownerAddress })))

  const skyUsdsStakeDetails$ = (mkrPrice?: BigNumber) =>
    onEveryBlock$.pipe(() => fromPromise(skyUsdsStakeDetails({ mkrPrice })))

  return {
    aaveLikeAvailableLiquidityInUSDC$: aaveV2Services.aaveLikeAvailableLiquidityInUSDC$,
    aaveLikeLiquidations$: aaveV2Services.aaveLikeLiquidations$, // @deprecated,
    aaveLikePosition$,
    // aaveLikeProtocolData$: aaveV2Services.aaveLikeProtocolData$,
    aaveLikeUserAccountData$: aaveV2Services.aaveLikeUserAccountData$,
    addGasEstimation$,
    ajnaPosition$,
    allowance$,
    allowanceForAccount$,
    allowanceForAccountEthers$,
    allowanceStateMachine,
    automationTriggersData$,
    balanceInfo$,
    balancesFromAddressInfoArray$,
    balancesInfoArray$,
    chainContext$,
    commonTransactionServices,
    contextForAddress$,
    daiEthTokenPrice$,
    dpmAccountStateMachine,
    dpmPositionDataV2$,
    dsr$,
    dsrDeposit$,
    erc4626Position$,
    exchangeQuote$,
    gasEstimation$,
    generalManageVault$,
    ilkDataList$,
    ilks$: ilksSupportedOnNetwork$,
    manageGuniVault$,
    manageMultiplyVault$,
    morphoPosition$,
    openGuniVault$,
    openMultiplyVault$,
    openVault$,
    positionIdFromDpmProxy$,
    potDsr$,
    potTotalValueLocked$,
    priceInfo$,
    protocols,
    reclaimCollateral$,
    skyUsdsWalletStakeDetails$,
    skyUsdsStakeDetails$,
    strategyConfig$,
    tokenPriceUSD$,
    tokenPriceUSDStatic$,
    totalValueLocked$,
    vaultBanners$,
    vaultHistory$,
    yields$,
    yieldsChange$,
    onEveryBlock$,
  }
}
