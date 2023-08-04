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
  hasMultiplePositions: boolean
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

const filterPositionWhenUrlParamsDefined = ({
  collateralToken,
  positions,
  product,
  proxy,
  quoteToken,
}: {
  collateralToken: string
  positions?: PositionCreated[]
  product: string
  proxy: string
  quoteToken: string
}) =>
  positions?.filter(
    (position) =>
      position.proxyAddress.toLowerCase() === proxy.toLowerCase() &&
      ((position.collateralTokenSymbol === collateralToken &&
        position.debtTokenSymbol === quoteToken) ||
        (position.collateralTokenAddress.toLowerCase() === collateralToken &&
          position.debtTokenAddress.toLowerCase() === quoteToken)) &&
      (product.toLowerCase() === 'earn'
        ? position.positionType.toLowerCase() === product.toLowerCase()
        : true),
  )[0]

const filterPositionWhenUrlParamsNotDefined = ({
  positions,
  proxy,
}: {
  positions?: PositionCreated[]
  proxy?: string
}) =>
  positions?.filter((position) => position.proxyAddress.toLowerCase() === proxy?.toLowerCase())[0]

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
      const hasMultiplePositions = Boolean(
        positions &&
          positions.filter(
            (item) => item.proxyAddress.toLowerCase() === dpmProxy?.proxy.toLowerCase(),
          ).length > 1,
      )
      const proxyPosition =
        collateralToken && quoteToken && product && dpmProxy
          ? filterPositionWhenUrlParamsDefined({
              positions,
              collateralToken,
              quoteToken,
              product,
              proxy: dpmProxy.proxy,
            })
          : filterPositionWhenUrlParamsNotDefined({ positions, proxy: dpmProxy?.proxy })

      return combineLatest(
        of(dpmProxy),
        of(proxyPosition),
        dpmProxy && proxyPosition
          ? checkMultipleVaultsFromApi$([dpmProxy.vaultId], proxyPosition.protocol)
          : of(undefined),
        of(hasMultiplePositions),
      )
    }),
    map(([dpmProxy, position, vaultsFromApi, hasMultiplePositions]) =>
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
            hasMultiplePositions,
          }
        : null,
    ),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}

export function getStaticDpmPositionData$({
  collateralToken,
  collateralTokenAddress,
  product,
  protocol,
  quoteToken,
  quoteTokenAddress,
}: {
  collateralToken: string
  collateralTokenAddress: string
  product: string
  protocol: string
  quoteToken: string
  quoteTokenAddress: string
}): Observable<DpmPositionData> {
  return EMPTY.pipe(
    startWith({
      collateralToken,
      collateralTokenAddress,
      hasMultiplePositions: false,
      product,
      protocol,
      proxy: ethers.constants.AddressZero,
      quoteToken,
      quoteTokenAddress,
      user: ethers.constants.AddressZero,
      vaultId: '0',
    }),
  )
}
