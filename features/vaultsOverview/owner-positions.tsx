import type BigNumber from 'bignumber.js'
import { call } from 'blockchain/calls/callsHelpers'
import { dogIlk } from 'blockchain/calls/dog'
import { tokenBalance } from 'blockchain/calls/erc20'
import { jugIlk } from 'blockchain/calls/jug'
import { observe } from 'blockchain/calls/observe'
import { pipHop, pipPeek, pipPeep, pipZzz } from 'blockchain/calls/osm'
import { spotIlk } from 'blockchain/calls/spot'
import { vatIlk } from 'blockchain/calls/vat'
import { createIlkData$, createIlkDataList$, createIlksSupportedOnNetwork$ } from 'blockchain/ilks'
import { NetworkIds } from 'blockchain/networks'
import { createOraclePriceData$, createTokenPriceInUSD$ } from 'blockchain/prices'
import { tokenPrices$ } from 'blockchain/prices.constants'
import { createAccountBalance$, createBalance$, createCollateralTokens$ } from 'blockchain/tokens'
import { getUserDpmProxies$, getUserDpmProxy$ } from 'blockchain/userDpmProxies'
import { decorateVaultsWithValue$ } from 'blockchain/vaults'
import type { AccountContext } from 'components/context'
import { getProxiesRelatedWithPosition$ } from 'features/aave/helpers'
import { createReadPositionCreatedEvents$ } from 'features/aave/services'
import type { PositionId } from 'features/aave/types'
import { getAjnaPositionsWithDetails$ } from 'features/ajna/positions/common/observables/getAjnaPosition'
import { createAutomationTriggersData } from 'features/automation/api/automationTriggersData'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { createDsrHistory$ } from 'features/dsr/helpers/dsrHistory'
import { chi, dsr } from 'features/dsr/helpers/potCalls'
import { createDsr$ } from 'features/dsr/utils/createDsr'
import { createProxyAddress$ as createDsrProxyAddress$ } from 'features/dsr/utils/proxy'
import type { ExchangeAction, ExchangeType } from 'features/exchange/exchange'
import { createExchangeQuote$ } from 'features/exchange/exchange'
import { createIlkDataListWithBalances$ } from 'features/ilks/ilksWithBalances'
import { getApiVaults } from 'features/shared/vaultApi'
import { vaultsWithHistory$ } from 'features/vaultHistory/vaultsHistory'
import type { AaveLikePosition } from 'features/vaultsOverview/pipes/positions'
import { refreshInterval } from 'helpers/context/constants'
import type { MainContext } from 'helpers/context/MainContext.types'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveV2Services } from 'lendingProtocols/aave-v2'
import { getAaveV3Services } from 'lendingProtocols/aave-v3'
import { getSparkV3Services } from 'lendingProtocols/spark-v3'
import { memoize } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, defer, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

import {
  createAaveV2Position$,
  createAaveV3DpmPosition$,
  createSparkV3DpmPosition$,
} from './pipes/positions'
import { createMakerPositionsList$ } from './pipes/positionsList'
import { createPositionsList$ } from './vaultsOverview'
import curry from 'ramda/src/curry'

export function useOwnerPositions(
  { chainContext$, context$, everyBlock$, once$, onEveryBlock$, oracleContext$ }: MainContext,
  {
    ilkToToken$,
    mainnetDpmProxies$,
    optimismDpmProxies$,
    arbitrumDpmProxies$,
    mainnetReadPositionCreatedEvents$,
    optimismReadPositionCreatedEvents$,
    arbitrumReadPositionCreatedEvents$,
    proxyAddress$,
    userSettings$,
    vaults$,
  }: AccountContext,
) {
  const mainnetPositionCreatedEventsForProtocol$ = memoize(
    (walletAddress: string, protocol: LendingProtocol) => {
      return mainnetReadPositionCreatedEvents$(walletAddress).pipe(
        map((events) => events.filter((event) => event.protocol === protocol)),
      )
    },
    (wallet, protocol) => `${wallet}-${protocol}`,
  )

  const mainnetSparkV3PositionCreatedEvents$ = memoize((walletAddress: string) => {
    return mainnetPositionCreatedEventsForProtocol$(walletAddress, LendingProtocol.SparkV3)
  })

  const tokenPriceUSDStatic$ = memoize(
    curry(createTokenPriceInUSD$)(once$, tokenPrices$),
    (tokens: string[]) => tokens.sort((a, b) => a.localeCompare(b)).join(','),
  )

  const userDpmProxy$ = memoize(curry(getUserDpmProxy$)(context$), (vaultId) => vaultId)

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$, userDpmProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const automationTriggersData$ = memoize(
    curry(createAutomationTriggersData)(chainContext$, onEveryBlock$, proxiesRelatedWithPosition$),
  )

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
  const sparkV3Services = getSparkV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.MAINNET,
  })

  const sparkMainnetSparkV3Positions$: (walletAddress: string) => Observable<AaveLikePosition[]> =
    memoize(
      curry(createSparkV3DpmPosition$)(
        context$,
        mainnetDpmProxies$,
        tokenPriceUSDStatic$,
        mainnetSparkV3PositionCreatedEvents$,
        getApiVaults,
        automationTriggersData$,
        sparkV3Services,
        NetworkIds.MAINNET,
      ),
      (wallet) => wallet,
    )

  const mainnetAaveV2PositionCreatedEvents$ = memoize((walletAddress: string) => {
    return mainnetPositionCreatedEventsForProtocol$(walletAddress, LendingProtocol.AaveV2)
  })

  const mainnetAaveV2Positions$: (walletAddress: string) => Observable<AaveLikePosition[]> =
    memoize(
      curry(createAaveV2Position$)(
        {
          dsProxy$: proxyAddress$,
          userDpmProxies$: mainnetDpmProxies$,
        },
        {
          tickerPrices$: tokenPriceUSDStatic$,
          context$,
          automationTriggersData$,
          readPositionCreatedEvents$: mainnetAaveV2PositionCreatedEvents$,
        },
        aaveV2Services,
      ),
    )

  const mainnetAaveV3PositionCreatedEvents$ = memoize((walletAddress: string) => {
    return mainnetPositionCreatedEventsForProtocol$(walletAddress, LendingProtocol.AaveV3)
  })

  const aaveMainnetAaveV3Positions$: (walletAddress: string) => Observable<AaveLikePosition[]> =
    memoize(
      curry(createAaveV3DpmPosition$)(
        context$,
        mainnetDpmProxies$,
        tokenPriceUSDStatic$,
        mainnetAaveV3PositionCreatedEvents$,
        getApiVaults,
        automationTriggersData$,
        aaveV3Services,
        NetworkIds.MAINNET,
      ),
      (wallet) => wallet,
    )

  const aaveOptimismPositions$: (walletAddress: string) => Observable<AaveLikePosition[]> = memoize(
    curry(createAaveV3DpmPosition$)(
      context$,
      optimismDpmProxies$,
      tokenPriceUSDStatic$,
      optimismReadPositionCreatedEvents$,
      getApiVaults,
      () => of<TriggersData | undefined>(undefined), // Triggers are not supported on optimism
      aaveV3OptimismServices,
      NetworkIds.OPTIMISMMAINNET,
    ),
    (wallet) => wallet,
  )

  const aaveArbitrumPositions$: (walletAddress: string) => Observable<AaveLikePosition[]> = memoize(
    curry(createAaveV3DpmPosition$)(
      context$,
      arbitrumDpmProxies$,
      tokenPriceUSDStatic$,
      arbitrumReadPositionCreatedEvents$,
      getApiVaults,
      () => of<TriggersData | undefined>(undefined), // Triggers are not supported on arbitrum
      aaveV3ArbitrumServices,
      NetworkIds.ARBITRUMMAINNET,
    ),
    (wallet) => wallet,
  )

  const aaveLikePositions$ = memoize((walletAddress: string) => {
    return combineLatest([
      mainnetAaveV2Positions$(walletAddress),
      aaveMainnetAaveV3Positions$(walletAddress),
      sparkMainnetSparkV3Positions$(walletAddress),
      aaveOptimismPositions$(walletAddress),
      aaveArbitrumPositions$(walletAddress),
    ]).pipe(
      map(
        ([
          mainnetAaveV2Positions,
          mainnetAaveV3Positions,
          mainnetSparkV3Positions,
          optimismAaveV3Positions,
          arbitrumAavePositions,
        ]) => {
          return [
            ...mainnetAaveV2Positions,
            ...mainnetAaveV3Positions,
            ...mainnetSparkV3Positions,
            ...optimismAaveV3Positions,
            ...arbitrumAavePositions,
          ]
        },
      ),
    )
  })

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

  const vaultWithValue$ = memoize(
    curry(decorateVaultsWithValue$)(vaults$, exchangeQuote$, userSettings$),
  )

  const vaultsHistoryAndValue$ = memoize(
    curry(vaultsWithHistory$)(chainContext$, vaultWithValue$, refreshInterval),
  )

  const vatIlksLean$ = observe(once$, chainContext$, vatIlk)
  const spotIlksLean$ = observe(once$, chainContext$, spotIlk)
  const jugIlksLean$ = observe(once$, chainContext$, jugIlk)
  const dogIlksLean$ = observe(once$, chainContext$, dogIlk)

  const ilkDataLean$ = memoize(
    curry(createIlkData$)(vatIlksLean$, spotIlksLean$, jugIlksLean$, dogIlksLean$, ilkToToken$),
  )
  const ilksSupportedOnNetwork$ = createIlksSupportedOnNetwork$(chainContext$)

  const ilkDataList$ = createIlkDataList$(ilkDataLean$, ilksSupportedOnNetwork$)

  const tokenBalanceLean$ = observe(once$, context$, tokenBalance)

  const balanceLean$ = memoize(
    curry(createBalance$)(once$, chainContext$, tokenBalanceLean$),
    (token, address) => `${token}_${address}`,
  )

  const pipZzzLean$ = observe(once$, chainContext$, pipZzz)
  const pipHopLean$ = observe(once$, context$, pipHop)
  const pipPeekLean$ = observe(once$, oracleContext$, pipPeek)
  const pipPeepLean$ = observe(once$, oracleContext$, pipPeep)

  const oraclePriceDataLean$ = memoize(
    curry(createOraclePriceData$)(
      chainContext$,
      pipPeekLean$,
      pipPeepLean$,
      pipZzzLean$,
      pipHopLean$,
    ),
    ({ token, requestedData }) => {
      return `${token}-${requestedData.join(',')}`
    },
  )

  const collateralTokens$ = createCollateralTokens$(ilksSupportedOnNetwork$, ilkToToken$)

  const accountBalances$ = curry(createAccountBalance$)(
    balanceLean$,
    collateralTokens$,
    oraclePriceDataLean$,
  )

  const ilksWithBalance$ = createIlkDataListWithBalances$(context$, ilkDataList$, accountBalances$)

  const positionsList$ = memoize(
    curry(createMakerPositionsList$)(context$, ilksWithBalance$, vaultsHistoryAndValue$),
  )

  const userDpmProxies$ = curry(getUserDpmProxies$)(context$)

  const readPositionCreatedEvents$ = memoize(
    curry(createReadPositionCreatedEvents$)(context$, userDpmProxies$),
  )

  const ajnaPositions$ = memoize(
    curry(getAjnaPositionsWithDetails$)(
      context$,
      userDpmProxies$,
      readPositionCreatedEvents$,
      tokenPriceUSDStatic$,
    ),
    (walletAddress: string) => walletAddress,
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

  const ownersPositionsList$ = memoize(
    curry(createPositionsList$)(positionsList$, aaveLikePositions$, ajnaPositions$, dsr$),
  )

  return {
    ownersPositionsList$: ownersPositionsList$,
  }
}
