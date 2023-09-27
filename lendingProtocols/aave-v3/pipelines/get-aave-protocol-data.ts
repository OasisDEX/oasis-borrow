import type { IPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type {
  AaveV3ConfigurationData,
  AaveV3UserReserveData,
  AaveV3UserReserveDataParameters,
} from 'blockchain/aave-v3'
import type {
  AaveLikeProtocolData,
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export type AaveOracleAssetPriceDataType = ({ token }: { token: string }) => Observable<BigNumber>

export type AaveUserConfigurationType = ({
  address,
}: {
  address: string
}) => Observable<AaveV3ConfigurationData>

export function getAaveProtocolData$(
  aaveUserReserveData$: (
    args: Omit<AaveV3UserReserveDataParameters, 'networkId'>,
  ) => Observable<AaveV3UserReserveData>,
  aaveLikeUserAccountData$: (
    args: AaveLikeUserAccountDataArgs,
  ) => Observable<AaveLikeUserAccountData>,
  aaveLikeOracleAssetPriceData$: AaveOracleAssetPriceDataType,
  aaveUserConfiguration$: AaveUserConfigurationType,
  aaveReservesList$: Observable<AaveV3ConfigurationData>,
  aaveOnChainPosition$: (params: {
    collateralToken: string
    debtToken: string
    proxyAddress: string
  }) => Observable<IPosition>,
  collateralToken: string,
  debtToken: string,
  proxyAddress: string,
): Observable<AaveLikeProtocolData> {
  return combineLatest(
    aaveUserReserveData$({ token: collateralToken, address: proxyAddress }),
    aaveLikeUserAccountData$({ address: proxyAddress }),
    aaveLikeOracleAssetPriceData$({ token: collateralToken }),
    aaveUserConfiguration$({ address: proxyAddress }),
    aaveReservesList$,
    aaveOnChainPosition$({
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
        aaveUserConfiguration,
        aaveReservesList,
        onChainPosition,
      ]) => {
        return {
          positionData: reserveData,
          accountData,
          oraclePrice: oraclePrice,
          position: onChainPosition,
          userConfiguration: aaveUserConfiguration,
          reservesList: aaveReservesList,
        }
      },
    ),
    distinctUntilChanged((a, b) => isEqual(a, b)),
  )
}
