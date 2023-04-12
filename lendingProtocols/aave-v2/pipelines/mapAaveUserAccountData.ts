import { AaveV2UserAccountData, AaveV2UserAccountDataParameters } from 'blockchain/aave'
import { UserAccountData, UserAccountDataArgs } from 'lendingProtocols/aaveCommon/userAccountData'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function mapAaveUserAccountData$(
  blockchainCall: (args: AaveV2UserAccountDataParameters) => Observable<AaveV2UserAccountData>,
  args: UserAccountDataArgs,
): Observable<UserAccountData> {
  return blockchainCall({ ...args }).pipe(
    map((userAccountDataV2) => ({
      totalCollateral: userAccountDataV2.totalCollateralETH,
      totalDebt: userAccountDataV2.totalDebtETH,
      availableBorrows: userAccountDataV2.availableBorrowsETH,
      currentLiquidationThreshold: userAccountDataV2.currentLiquidationThreshold,
      ltv: userAccountDataV2.ltv,
      healthFactor: userAccountDataV2.healthFactor,
    })),
  )
}
