import { Position } from '@oasisdex/oasis-actions'
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

import { AaveProtocolData } from '../state'

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
  aaveReserveConfigurationData$: AaveReserveConfigurationDataType,
  collateralToken: string,
  address: string,
): Observable<AaveProtocolData> {
  return combineLatest(
    aaveUserReserveData$({ token: collateralToken, address }),
    aaveUserAccountData$({ address }),
    aaveOracleAssetPriceData$({ token: collateralToken }),
    aaveReserveConfigurationData$({ token: collateralToken }),
    aaveUserConfiguration$({ address }),
    aaveReservesList$(),
  ).pipe(
    map(
      ([
        reserveData,
        accountData,
        oraclePrice,
        reserveConfigurationData,
        aaveUserConfiguration,
        aaveReservesList,
      ]) => {
        const pos = new Position(
          { amount: new BigNumber(accountData.totalDebtETH.toString()) },
          {
            amount: new BigNumber(reserveData.currentATokenBalance.toString()),
            denomination: collateralToken,
          },
          oraclePrice,
          {
            dustLimit: new BigNumber(0),
            maxLoanToValue: reserveConfigurationData.ltv,
            liquidationThreshold: reserveConfigurationData.liquidationThreshold,
          },
        )

        return {
          positionData: reserveData,
          accountData: accountData,
          oraclePrice: oraclePrice,
          position: pos,
          aaveUserConfiguration,
          aaveReservesList,
        }
      },
    ),
    distinctUntilChanged(isEqual),
  )
}
