import { views } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { Tickers } from 'blockchain/prices'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { AjnaGenericPosition, AjnaProduct } from 'features/ajna/common/types'
import { getAjnaPoolAddress } from 'features/ajna/positions/common/helpers/getAjnaPoolAddress'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import { checkMultipleVaultsFromApi$ } from 'features/shared/vaultApi'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual, uniq } from 'lodash'
import { combineLatest, iif, Observable, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export interface AjnaPositionDetails {
  position: AjnaGenericPosition
  details: DpmPositionData
}

export function getAjnaPosition$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number> | undefined,
  collateralPrice: BigNumber,
  quotePrice: BigNumber,
  { collateralToken, product, protocol, proxy, quoteToken }: DpmPositionData,
  collateralAddress?: string,
  quoteAddress?: string,
): Observable<AjnaGenericPosition> {
  return combineLatest(
    context$,
    iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined)),
  ).pipe(
    switchMap(async ([context]) => {
      if (protocol.toLowerCase() !== LendingProtocol.Ajna) return null
      const { ajnaPoolPairs, ajnaPoolInfo, ajnaRewardsManager } = getNetworkContracts(
        NetworkIds.MAINNET,
        context.chainId,
      )

      const commonPayload = {
        collateralPrice,
        quotePrice,
        proxyAddress: proxy,
        poolAddress:
          collateralAddress && quoteAddress
            ? await getAjnaPoolAddress(collateralAddress, quoteAddress)
            : ajnaPoolPairs[`${collateralToken}-${quoteToken}` as keyof typeof ajnaPoolPairs]
                .address,
      }

      const commonDependency = {
        poolInfoAddress: ajnaPoolInfo.address,
        rewardsManagerAddress: ajnaRewardsManager.address,
        provider: getRpcProvider(context.chainId),
        getPoolData: getAjnaPoolData,
      }

      switch (product as AjnaProduct) {
        case 'borrow':
        case 'multiply':
          return await views.ajna.getPosition(commonPayload, commonDependency)
        case 'earn':
          return await views.ajna.getEarnPosition(commonPayload, {
            ...commonDependency,
            getEarnData: getAjnaEarnData,
          })
      }
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}

export function getAjnaPositionDetails$(
  context$: Observable<Context>,
  collateralPrice: BigNumber,
  quotePrice: BigNumber,
  details: DpmPositionData,
): Observable<AjnaPositionDetails> {
  return getAjnaPosition$(context$, undefined, collateralPrice, quotePrice, details).pipe(
    switchMap((position) => {
      return [{ position, details }]
    }),
    shareReplay(1),
  )
}

export function getAjnaPositionsWithDetails$(
  context$: Observable<Context>,
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]>,
  readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>,
  tokenPriceUSD$: (tokens: string[]) => Observable<Tickers>,
  walletAddress: string,
): Observable<AjnaPositionDetails[]> {
  return combineLatest(
    userDpmProxies$(walletAddress),
    readPositionCreatedEvents$(walletAddress),
    context$,
  ).pipe(
    switchMap(([userDpmProxies, positionCreatedEvents]) => {
      const idMap = userDpmProxies.reduce<{ [key: string]: string }>(
        (a, v) => ({ ...a, [v.proxy]: v.vaultId }),
        {},
      )

      if (positionCreatedEvents.length === 0) return of([])

      const tokens: string[] = uniq(
        positionCreatedEvents
          .map(({ collateralTokenSymbol, debtTokenSymbol }) => [
            collateralTokenSymbol,
            debtTokenSymbol,
          ])
          .flat(),
      )

      return tokenPriceUSD$(tokens).pipe(
        switchMap((tokenPrice) => {
          return combineLatest(
            positionCreatedEvents
              // @ts-ignore
              .filter(({ protocol }) => protocol.toLowerCase() === LendingProtocol.Ajna)
              .map(
                ({
                  collateralTokenSymbol,
                  debtTokenSymbol,
                  positionType,
                  protocol,
                  proxyAddress,
                }) => {
                  const vaultId = idMap[proxyAddress]

                  return combineLatest(
                    checkMultipleVaultsFromApi$([idMap[proxyAddress]], protocol),
                  ).pipe(
                    switchMap(([vaultsFromApi]) =>
                      getAjnaPositionDetails$(
                        context$,
                        tokenPrice[collateralTokenSymbol],
                        tokenPrice[debtTokenSymbol],
                        {
                          collateralToken: collateralTokenSymbol,
                          product:
                            vaultsFromApi[vaultId]?.toLowerCase() || positionType.toLowerCase(),
                          protocol,
                          proxy: proxyAddress,
                          quoteToken: debtTokenSymbol,
                          user: walletAddress,
                          vaultId,
                        },
                      ),
                    ),
                  )
                },
              ),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
