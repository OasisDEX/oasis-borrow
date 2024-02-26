import type { PositionType } from '@oasisdex/dma-library'
import { isCorrelatedPosition } from '@oasisdex/dma-library'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { ethers } from 'ethers'
import type { AddressesRelatedWithPosition } from 'features/aave/helpers'
import type { PositionCreated } from 'features/aave/services'
import { readPositionCreatedEvents$ } from 'features/aave/services'
import type { PositionId } from 'features/aave/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { getApiVault } from 'features/shared/vaultApi'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { LendingProtocol } from 'lendingProtocols'
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

const mapAaveYieldLoopToMultiply = ({
  collateralToken,
  quoteToken,
  protocol,
  positionType,
}: {
  collateralToken: string
  quoteToken: string
  protocol: LendingProtocol
  positionType: PositionType
}) => {
  if (
    positionType === 'Earn' &&
    isCorrelatedPosition(collateralToken, quoteToken) &&
    [LendingProtocol.SparkV3, LendingProtocol.AaveV3, LendingProtocol.AaveV2].includes(protocol)
  ) {
    return 'Multiply'
  }

  return positionType
}

const filterPositionWhenUrlParamsDefined = ({
  collateralToken,
  positions,
  product,
  protocol,
  protocolRaw,
  proxy,
  quoteToken,
}: {
  collateralToken: string
  positions?: PositionCreated[]
  product: string
  protocol: LendingProtocol
  protocolRaw: string
  proxy: string
  quoteToken: string
}) =>
  positions
    ?.map(({ collateralTokenSymbol, debtTokenSymbol, ...position }) => ({
      ...position,
      collateralTokenSymbol: getTokenDisplayName(collateralTokenSymbol),
      debtTokenSymbol: getTokenDisplayName(debtTokenSymbol),
      positionType: mapAaveYieldLoopToMultiply({
        collateralToken,
        quoteToken,
        protocol,
        positionType: position.positionType,
      }),
    }))
    ?.find(
      ({
        collateralTokenAddress,
        collateralTokenSymbol,
        debtTokenAddress,
        debtTokenSymbol,
        positionType,
        protocol: positionProtocol,
        protocolRaw: positionProtocolRaw,
        proxyAddress,
      }) => {
        return (
          positionProtocol === protocol &&
          positionProtocolRaw === protocolRaw &&
          proxyAddress.toLowerCase() === proxy.toLowerCase() &&
          [collateralTokenAddress.toLowerCase(), collateralTokenSymbol].includes(collateralToken) &&
          [debtTokenAddress.toLowerCase(), debtTokenSymbol].includes(quoteToken) &&
          ((product.toLowerCase() === 'earn' &&
            positionType.toLowerCase() === product.toLowerCase()) ||
            (['borrow', 'multiply'].includes(product.toLocaleLowerCase()) &&
              ['borrow', 'multiply'].includes(positionType.toLocaleLowerCase())))
        )
      },
    )

export function getDpmPositionDataV2$(
  proxiesForPosition$: (
    positionId: PositionId,
    networkId: OmniSupportedNetworkIds,
  ) => Observable<AddressesRelatedWithPosition>,
  positionId: PositionId,
  networkId: OmniSupportedNetworkIds,
  collateralToken: string,
  quoteToken: string,
  product: string,
  protocol: LendingProtocol,
  protocolRaw: string,
): Observable<DpmPositionData> {
  return proxiesForPosition$(positionId, networkId).pipe(
    switchMap(({ dpmProxy }) =>
      combineLatest(
        of(dpmProxy),
        dpmProxy ? readPositionCreatedEvents$(dpmProxy.user, networkId) : of(undefined),
      ),
    ),
    switchMap(([dpmProxy, positions]) => {
      const hasMultiplePositions = Boolean(
        positions &&
          positions.filter(
            (item) => item.proxyAddress.toLowerCase() === dpmProxy?.proxy.toLowerCase(),
          ).length > 1,
      )

      const proxyPosition = filterPositionWhenUrlParamsDefined({
        collateralToken,
        positions,
        product,
        protocol,
        protocolRaw,
        proxy: dpmProxy?.proxy ?? ethers.constants.AddressZero,
        quoteToken,
      })

      return combineLatest(
        of(dpmProxy),
        of(positions),
        of(proxyPosition),
        dpmProxy && proxyPosition && networkId
          ? getApiVault({
              vaultId: Number(dpmProxy.vaultId),
              owner: dpmProxy.user,
              protocol: proxyPosition.protocol,
              chainId: networkId,
              tokenPair: `${proxyPosition.collateralTokenSymbol}-${proxyPosition.debtTokenSymbol}`,
            })
          : of(undefined),
        of(hasMultiplePositions),
      ).pipe(
        map(([dpmProxy, positions, position, vaultsFromApi, hasMultiplePositions]) =>
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
            : Array.isArray(positions) || !dpmProxy
            ? null
            : undefined,
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
