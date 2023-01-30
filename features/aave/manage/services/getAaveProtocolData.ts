import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import {
  AaveV2ConfigurationData,
  AaveV2UserAccountData,
  AaveV2UserAccountDataParameters,
} from 'blockchain/calls/aave/aaveV2LendingPool'
import {
  AaveV2ReserveConfigurationData,
  AaveV2UserReserveData,
  AaveV2UserReserveDataParameters,
} from 'blockchain/calls/aave/aaveV2ProtocolDataProvider'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export interface AaveProtocolData {
  positionData: AaveV2UserReserveData
  accountData: AaveV2UserAccountData
  oraclePrice: BigNumber
  position: IPosition
  aaveUserConfiguration: AaveV2ConfigurationData
  aaveReservesList: AaveV2ConfigurationData
}

export type AaveOracleAssetPriceDataType = ({ token }: { token: string }) => Observable<BigNumber>

export type AaveUserConfigurationType = ({
  address,
}: {
  address: string
}) => Observable<AaveV2ConfigurationData>

export type AaveReserveConfigurationDataType = ({
  token,
}: {
  token: string
}) => Observable<AaveV2ReserveConfigurationData>

export function getAaveProtocolData$(
  aaveUserReserveData$: (
    args: AaveV2UserReserveDataParameters,
  ) => Observable<AaveV2UserReserveData>,
  aaveUserAccountData$: (
    args: AaveV2UserAccountDataParameters,
  ) => Observable<AaveV2UserAccountData>,
  aaveOracleAssetPriceData$: AaveOracleAssetPriceDataType,
  aaveUserConfiguration$: AaveUserConfigurationType,
  aaveReservesList$: () => Observable<AaveV2ConfigurationData>,
  aaveOnChainPosition$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<IPosition>,
  collateralToken: string,
  debtToken: string,
  proxyAddress: string,
): Observable<AaveProtocolData> {
  return combineLatest(
    aaveUserReserveData$({ token: collateralToken, address: proxyAddress }),
    aaveUserAccountData$({ address: proxyAddress }),
    aaveOracleAssetPriceData$({ token: collateralToken }),
    aaveUserConfiguration$({ address: proxyAddress }),
    aaveReservesList$(),
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
          aaveUserConfiguration,
          aaveReservesList,
        }
      },
    ),
    distinctUntilChanged(isEqual),
  )
}
