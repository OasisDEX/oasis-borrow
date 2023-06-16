import { IPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import {
  AaveV3ConfigurationData,
  AaveV3UserReserveData,
  AaveV3UserReserveDataParameters,
} from 'blockchain/aave-v3'
import { ProtocolData, UserAccountData, UserAccountDataArgs } from 'lendingProtocols/aaveCommon'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
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
  aaveUserAccountData$: (args: UserAccountDataArgs) => Observable<UserAccountData>,
  aaveOracleAssetPriceData$: AaveOracleAssetPriceDataType,
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
): Observable<ProtocolData> {
  return combineLatest(
    aaveUserReserveData$({ token: collateralToken, address: proxyAddress }),
    aaveUserAccountData$({ address: proxyAddress }),
    aaveOracleAssetPriceData$({ token: collateralToken }),
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
