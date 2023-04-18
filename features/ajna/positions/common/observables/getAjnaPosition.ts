import { views } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { ethers } from 'ethers'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { AjnaGenericPosition, AjnaProduct } from 'features/ajna/common/types'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
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
): Observable<AjnaGenericPosition> {
  return combineLatest(
    context$,
    iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined)),
  ).pipe(
    switchMap(async ([context]) => {
      if (protocol !== 'Ajna') return null
      const { ajnaPoolPairs, ajnaPoolInfo, ajnaRewardsManager } = getNetworkContracts(
        context.chainId,
      )

      const commonPayload = {
        collateralPrice,
        quotePrice,
        proxyAddress: proxy,
        poolAddress:
          ajnaPoolPairs[`${collateralToken}-${quoteToken}` as keyof typeof ajnaPoolPairs].address,
      }

      const commonDependency = {
        poolInfoAddress: ajnaPoolInfo.address,
        rewardsManagerAddress: ajnaRewardsManager.address,
        provider: context.rpcProvider,
        getPoolData: getAjnaPoolData,
      }

      switch (product as AjnaProduct) {
        case 'borrow':
          return await views.ajna.getPosition(commonPayload, commonDependency)
        case 'earn':
          return await views.ajna.getEarnPosition(commonPayload, {
            ...commonDependency,
            getEarnData: getAjnaEarnData,
          })
        case 'multiply':
          // TODO: replace with getting multiply position from lib
          const fakeMultiplyPosition = await views.ajna.getPosition(
            { ...commonPayload, proxyAddress: ethers.constants.AddressZero },
            commonDependency,
          )

          return {
            ...fakeMultiplyPosition,
            multiply: new BigNumber(1.5),
          }
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
              .filter(({ protocol }) => protocol === 'Ajna')
              .map(
                ({
                  collateralTokenSymbol,
                  debtTokenSymbol,
                  positionType,
                  protocol,
                  proxyAddress,
                }) => {
                  return getAjnaPositionDetails$(
                    context$,
                    tokenPrice[collateralTokenSymbol],
                    tokenPrice[debtTokenSymbol],
                    {
                      collateralToken: collateralTokenSymbol,
                      product: positionType.toLowerCase(),
                      protocol,
                      proxy: proxyAddress,
                      quoteToken: debtTokenSymbol,
                      user: walletAddress,
                      vaultId: idMap[proxyAddress],
                    },
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
