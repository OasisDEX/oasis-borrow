import type { IPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { SparkV3ConfigurationData } from 'blockchain/spark-v3'
import type { AaveLikeProtocolData, AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export type SparkOracleAssetPriceDataType = ({ token }: { token: string }) => Observable<BigNumber>

export type SparkUserConfigurationType = ({
  address,
}: {
  address: string
}) => Observable<SparkV3ConfigurationData>

export function getSparkProtocolData$(
  reserveData$: (args: { token: string }) => Observable<AaveLikeReserveData>,
  sparkOnChainPosition$: (params: {
    collateralToken: string
    debtToken: string
    proxyAddress: string
  }) => Observable<IPosition>,
  collateralToken: string,
  debtToken: string,
  proxyAddress: string,
): Observable<AaveLikeProtocolData> {
  return combineLatest(
    sparkOnChainPosition$({
      collateralToken,
      debtToken,
      proxyAddress,
    }),
    reserveData$({ token: collateralToken }),
    reserveData$({ token: debtToken }),
  ).pipe(
    map(([onChainPosition, collateralReserveData, debtReserveData]) => {
      return {
        position: onChainPosition,
        reserveData: {
          collateral: collateralReserveData,
          debt: debtReserveData,
        },
      }
    }),
    distinctUntilChanged((a, b) => isEqual(a, b)),
  )
}
