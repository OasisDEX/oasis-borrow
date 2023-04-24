import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import {
  AaveV3ConfigurationData,
  AaveV3ReserveConfigurationData,
  AaveV3UserAccountData,
  AaveV3UserAccountDataParameters,
  AaveV3UserReserveData,
  AaveV3UserReserveDataParameters,
} from 'blockchain/aave-v3'
import { ProtocolData } from 'lendingProtocols/aaveCommon'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { switchMap } from 'rxjs/operators'

export type AaveOracleAssetPriceDataType = ({ token }: { token: string }) => Observable<BigNumber>

export type AaveUserConfigurationType = ({
  address,
}: {
  address: string
}) => Observable<AaveV3ConfigurationData>

export type AaveReserveConfigurationDataType = ({
  token,
}: {
  token: string
}) => Observable<AaveV3ReserveConfigurationData>

export function getAaveProtocolData$(
  aaveUserReserveData$: (
    args: AaveV3UserReserveDataParameters,
  ) => Observable<AaveV3UserReserveData>,
  aaveUserAccountData$: (
    args: AaveV3UserAccountDataParameters,
  ) => Observable<AaveV3UserAccountData>,
  aaveOracleAssetPriceData$: AaveOracleAssetPriceDataType,
  aaveUserConfiguration$: AaveUserConfigurationType,
  aaveReservesList$: Observable<AaveV3ConfigurationData>,
  aaveOnChainPosition$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<IPosition>,
  aaveBaseUnit$: Observable<BigNumber>,
  collateralToken: string,
  debtToken: string,
  proxyAddress: string,
): Observable<ProtocolData> {
  return aaveBaseUnit$.pipe(
    switchMap((baseUnit) => {
      return combineLatest(
        aaveUserReserveData$({ token: collateralToken, address: proxyAddress }),
        aaveUserAccountData$({ address: proxyAddress, baseCurrencyUnit: baseUnit }),
        aaveOracleAssetPriceData$({ token: collateralToken }),
        aaveUserConfiguration$({ address: proxyAddress }),
        aaveReservesList$,
        aaveOnChainPosition$(collateralToken, debtToken, proxyAddress),
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
              accountData: accountData,
              oraclePrice: oraclePrice,
              position: onChainPosition,
              userConfiguration: aaveUserConfiguration,
              reservesList: aaveReservesList,
            }
          },
        ),
        distinctUntilChanged((a, b) => isEqual(a, b)),
      )
    }),
  )
}
