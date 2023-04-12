import BigNumber from 'bignumber.js'
import { AaveV3UserAccountData, AaveV3UserAccountDataParameters } from 'blockchain/aave-v3'
import { UserAccountData, UserAccountDataArgs } from 'lendingProtocols/aaveCommon/userAccountData'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { switchMap } from 'rxjs/operators'

export function mapAaveUserAccountData$(
  blockchainCall: (args: AaveV3UserAccountDataParameters) => Observable<AaveV3UserAccountData>,
  baseUnit$: Observable<BigNumber>,
  args: UserAccountDataArgs,
): Observable<UserAccountData> {
  return baseUnit$.pipe(
    switchMap((baseUnit) =>
      blockchainCall({ ...args, baseCurrencyUnit: baseUnit }).pipe(
        map((userAccountDataV2) => ({
          totalCollateral: userAccountDataV2.totalCollateralBase,
          totalDebt: userAccountDataV2.totalDebtBase,
          availableBorrows: userAccountDataV2.availableBorrowsBase,
          currentLiquidationThreshold: userAccountDataV2.currentLiquidationThreshold,
          ltv: userAccountDataV2.ltv,
          healthFactor: userAccountDataV2.healthFactor,
        })),
      ),
    ),
  )
}
