import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import {
  AaveConfigurationData,
  AaveUserAccountData,
  AaveUserAccountDataParameters,
} from 'blockchain/calls/aave/aaveLendingPool'
import {
  AaveReserveConfigurationData,
  AaveUserReserveData,
  AaveUserReserveDataParameters,
} from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export interface AaveProtocolData {
  positionData: AaveUserReserveData
  accountData: AaveUserAccountData
  oraclePrice: BigNumber
  position: IPosition
  aaveUserConfiguration: AaveConfigurationData
  aaveReservesList: AaveConfigurationData
}

export type AaveOracleAssetPriceDataType = ({ token }: { token: string }) => Observable<BigNumber>

export type AaveUserConfigurationType = ({
  address,
}: {
  address: string
}) => Observable<AaveConfigurationData>

export type AaveReserveConfigurationDataType = ({
  token,
}: {
  token: string
}) => Observable<AaveReserveConfigurationData>

export function getAaveProtocolData$(
  aaveUserReserveData$: (args: AaveUserReserveDataParameters) => Observable<AaveUserReserveData>,
  aaveUserAccountData$: (args: AaveUserAccountDataParameters) => Observable<AaveUserAccountData>,
  aaveOracleAssetPriceData$: AaveOracleAssetPriceDataType,
  aaveUserConfiguration$: AaveUserConfigurationType,
  aaveReservesList$: () => Observable<AaveConfigurationData>,
  tempPositionFromLib$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<IPosition>,
  collateralToken: string,
  debtToken: string,
  address: string,
): Observable<AaveProtocolData> {
  return combineLatest(
    aaveUserReserveData$({ token: collateralToken, address }),
    aaveUserAccountData$({ address }),
    aaveOracleAssetPriceData$({ token: collateralToken }),
    aaveUserConfiguration$({ address }),
    aaveReservesList$(),
    tempPositionFromLib$(collateralToken, debtToken, address),
  ).pipe(
    map(
      ([
        reserveData,
        accountData,
        oraclePrice,
        aaveUserConfiguration,
        aaveReservesList,
        tempPositionFromLib,
      ]) => {
        return {
          positionData: reserveData,
          accountData: accountData,
          oraclePrice: oraclePrice,
          position: tempPositionFromLib,
          aaveUserConfiguration,
          aaveReservesList,
        }
      },
    ),
    distinctUntilChanged(isEqual),
  )
}
