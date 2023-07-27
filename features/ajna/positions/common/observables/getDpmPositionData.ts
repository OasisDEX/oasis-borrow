import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { ethers } from 'ethers'
import { ProxiesRelatedWithPosition } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { PositionId } from 'features/aave/types'
import { checkMultipleVaultsFromApi$ } from 'features/shared/vaultApi'
import { isEqual } from 'lodash'
import { combineLatest, EMPTY, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators'

export interface DpmPositionData extends UserDpmAccount {
  collateralToken: string
  collateralTokenAddress: string
  product: string
  protocol: string
  quoteToken: string
  quoteTokenAddress: string
}

export function getDpmPositionData$(
  proxiesForPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  lastCreatedPositionForProxy$: (proxyAddress: string) => Observable<PositionCreated>,
  positionId: PositionId,
): Observable<DpmPositionData> {
  return proxiesForPosition$(positionId).pipe(
    switchMap(({ dpmProxy }) => {
      return combineLatest(
        of(dpmProxy),
        dpmProxy ? lastCreatedPositionForProxy$(dpmProxy.proxy) : of(undefined),
      )
    }),
    switchMap(([dpmProxy, lastCreatedPosition]) => {
      return combineLatest(
        of(dpmProxy),
        of(lastCreatedPosition),
        dpmProxy && lastCreatedPosition
          ? checkMultipleVaultsFromApi$([dpmProxy.vaultId], lastCreatedPosition.protocol)
          : of(undefined),
      )
    }),
    map(([dpmProxy, lastCreatedPosition, vaultsFromApi]) => {
      return dpmProxy && lastCreatedPosition && vaultsFromApi
        ? {
            ...dpmProxy,
            collateralToken: lastCreatedPosition.collateralTokenSymbol,
            collateralTokenAddress: lastCreatedPosition.collateralTokenAddress,
            product: (
              vaultsFromApi[dpmProxy.vaultId] || lastCreatedPosition.positionType
            ).toLowerCase(),
            protocol: lastCreatedPosition.protocol,
            quoteToken: lastCreatedPosition.debtTokenSymbol,
            quoteTokenAddress: lastCreatedPosition.debtTokenAddress,
          }
        : null
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}

export function getDpmPositionDataV2$(
  proxiesForPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  readPositionCreatedEvents$: (walletAddress: string) => Observable<PositionCreated[]>,
  positionId: PositionId,
  collateralToken?: string,
  quoteToken?: string,
  product?: string,
): Observable<DpmPositionData> {
  return proxiesForPosition$(positionId).pipe(
    switchMap(({ dpmProxy }) =>
      combineLatest(
        of(dpmProxy),
        dpmProxy ? readPositionCreatedEvents$(dpmProxy.user) : of(undefined),
      ),
    ),
    switchMap(([dpmProxy, positions]) => {
      const proxyPosition =
        collateralToken && quoteToken && product
          ? positions?.filter(
              (position) =>
                position.proxyAddress.toLowerCase() === dpmProxy?.proxy.toLowerCase() &&
                position.collateralTokenSymbol === collateralToken &&
                position.debtTokenSymbol === quoteToken &&
                position.positionType.toLowerCase() === product.toLowerCase(),
            )[0]
          : positions?.[0]

      return combineLatest(
        of(dpmProxy),
        of(proxyPosition),
        dpmProxy && proxyPosition
          ? checkMultipleVaultsFromApi$([dpmProxy.vaultId], proxyPosition.protocol)
          : of(undefined),
      )
    }),
    map(([dpmProxy, position, vaultsFromApi]) =>
      dpmProxy && position && vaultsFromApi
        ? {
            ...dpmProxy,
            collateralToken: position.collateralTokenSymbol,
            collateralTokenAddress: position.collateralTokenAddress,
            product: (position.positionType === 'Earn'
              ? position.positionType
              : vaultsFromApi[dpmProxy.vaultId] || position.positionType
            ).toLowerCase(),
            protocol: position.protocol,
            quoteToken: position.debtTokenSymbol,
            quoteTokenAddress: position.debtTokenAddress,
          }
        : null,
    ),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}

export function getStaticDpmPositionData$({
  collateralToken,
  product,
  protocol,
  quoteToken,
}: {
  collateralToken: string
  product: string
  protocol: string
  quoteToken: string
}): Observable<DpmPositionData> {
  return EMPTY.pipe(
    startWith({
      collateralToken,
      collateralTokenAddress: ethers.constants.AddressZero,
      product,
      protocol,
      proxy: ethers.constants.AddressZero,
      quoteToken,
      quoteTokenAddress: ethers.constants.AddressZero,
      user: ethers.constants.AddressZero,
      vaultId: '0',
    }),
  )
}
