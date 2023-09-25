import type { IPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type {
  SparkV3ConfigurationData,
  SparkV3UserReserveData,
  SparkV3UserReserveDataParameters,
} from 'blockchain/spark-v3'
import type {
  AaveLikeProtocolData,
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common'
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
  sparkUserReserveData$: (
    args: Omit<SparkV3UserReserveDataParameters, 'networkId'>,
  ) => Observable<SparkV3UserReserveData>,
  sparkUserAccountData$: (args: AaveLikeUserAccountDataArgs) => Observable<AaveLikeUserAccountData>,
  sparkOracleAssetPriceData$: SparkOracleAssetPriceDataType,
  sparkUserConfiguration$: SparkUserConfigurationType,
  sparkReservesList$: Observable<SparkV3ConfigurationData>,
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
    sparkUserReserveData$({ token: collateralToken, address: proxyAddress }),
    sparkUserAccountData$({ address: proxyAddress }),
    sparkOracleAssetPriceData$({ token: collateralToken }),
    sparkUserConfiguration$({ address: proxyAddress }),
    sparkReservesList$,
    sparkOnChainPosition$({
      collateralToken,
      debtToken,
      proxyAddress,
    }),
  ).pipe(
    map(
      ([
        reserveData,
        accountData,
        oraclePrice,
        sparkUserConfiguration,
        sparkReservesList,
        onChainPosition,
      ]) => {
        return {
          positionData: reserveData,
          accountData,
          oraclePrice: oraclePrice,
          position: onChainPosition,
          userConfiguration: sparkUserConfiguration,
          reservesList: sparkReservesList,
        }
      },
    ),
    distinctUntilChanged((a, b) => isEqual(a, b)),
  )
}
