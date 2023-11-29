import type { NetworkIds } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { ethers } from 'ethers'
import type { ProxiesRelatedWithPosition } from 'features/aave/helpers'
import type { PositionCreated } from 'features/aave/services'
import type { PositionId } from 'features/aave/types'
import { getApiVault } from 'features/shared/vaultApi'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, EMPTY, of } from 'rxjs'
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
  positions
    ?.map(({ collateralTokenSymbol, debtTokenSymbol, ...position }) => ({
      ...position,
      collateralTokenSymbol: collateralTokenSymbol === 'WETH' ? 'ETH' : collateralTokenSymbol,
      debtTokenSymbol: debtTokenSymbol === 'WETH' ? 'ETH' : debtTokenSymbol,
    }))
    ?.filter(
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
  chainId: NetworkIds,
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
        dpmProxy && proxyPosition && chainId
          ? getApiVault({
              vaultId: Number(dpmProxy.vaultId),
              protocol: proxyPosition.protocol,
              chainId,
              tokenPair: `${proxyPosition.collateralTokenSymbol}-${proxyPosition.debtTokenSymbol}`,
            })
          : of(undefined),
        of(hasMultiplePositions),
      ).pipe(
        map(([dpmProxy, position, vaultsFromApi, hasMultiplePositions]) =>
          dpmProxy && position
            ? {
                ...dpmProxy,
                collateralToken: position.collateralTokenSymbol,
                collateralTokenAddress: position.collateralTokenAddress,
                product: (position.positionType === 'Earn'
                  ? position.positionType
                  : vaultsFromApi?.type || position.positionType
                ).toLowerCase(),
                protocol: position.protocol,
                quoteToken: position.debtTokenSymbol,
                quoteTokenAddress: position.debtTokenAddress,
                hasMultiplePositions,
              }
            : null,
        ),
      )
    }),
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
