import type { PositionType } from '@oasisdex/dma-library'
import { isCorrelatedPosition } from '@oasisdex/dma-library'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { ethers } from 'ethers'
import type { PositionFromUrl } from 'features/omni-kit/observables'
import { getPositionsFromUrlData } from 'features/omni-kit/observables'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { getApiVault } from 'features/shared/vaultApi'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual, uniq } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, EMPTY, from, of } from 'rxjs'
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

// Currently aave-like correlated positions are opened as earn dpm product
// which is not common approach in other protocols (ajna, morpho uses multiply product type)
// therefore mapping is needed to be able to read info about position
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
    return 'Multiply' as PositionType
  }

  return positionType
}

const filterPositionWhenUrlParamsDefined = ({
  collateralToken,
  pairId,
  positions,
  product,
  protocol,
  quoteToken,
}: {
  collateralToken: string
  pairId: number
  positions?: PositionFromUrl[]
  product: string
  protocol: LendingProtocol
  protocolRaw: string
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
        pairId: positionPairId,
        positionType,
        protocol: positionProtocol,
      }) => {
        return (
          positionProtocol === protocol &&
          // positionProtocolRaw === protocolRaw && // no need to compare protocolRaw as it's already checked in protocol check
          positionPairId === pairId &&
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
  positionId: number,
  networkId: OmniSupportedNetworkIds,
  collateralToken: string,
  quoteToken: string,
  product: string,
  protocol: LendingProtocol,
  protocolRaw: string,
  pairId: number,
): Observable<DpmPositionData> {
  return from(
    getPositionsFromUrlData({
      networkId,
      pairId,
      positionId,
      protocol,
    }),
  ).pipe(
    switchMap(({ dpmAddress, owner, positions }) =>
      combineLatest(
        of({ dpmAddress, owner, positions }),
        identifyTokens$(
          networkId,
          uniq(
            positions.flatMap(({ collateralTokenSymbol, debtTokenSymbol }) => [
              collateralTokenSymbol,
              debtTokenSymbol,
            ]),
          ),
        ),
      ),
    ),
    switchMap(([{ owner, positions }]) => {
      const position = filterPositionWhenUrlParamsDefined({
        collateralToken,
        pairId,
        positions,
        product,
        protocol,
        protocolRaw,
        quoteToken,
      })

      return combineLatest(
        position && networkId
          ? getApiVault({
              vaultId: Number(positionId),
              owner,
              protocol,
              chainId: networkId,
              tokenPair: `${position.collateralTokenSymbol}-${position.debtTokenSymbol}`,
            })
          : of(undefined),
      ).pipe(
        map(([vaultsFromApi]) =>
          position
            ? {
                proxy: position.proxyAddress,
                user: owner,
                vaultId: positionId,
                collateralToken: position.collateralTokenSymbol,
                collateralTokenAddress: position.collateralTokenAddress,
                product: (position.positionType === 'Earn'
                  ? position.positionType
                  : vaultsFromApi?.type || position.positionType
                ).toLowerCase(),
                protocol: position.protocol,
                quoteToken: position.debtTokenSymbol,
                quoteTokenAddress: position.debtTokenAddress,
                hasMultiplePositions: positions.length > 1,
              }
            : Array.isArray(positions)
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
