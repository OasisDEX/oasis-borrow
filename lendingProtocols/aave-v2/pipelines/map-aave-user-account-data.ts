import { getAaveV2UserAccountData } from 'blockchain/aave'
import { UserAccountData, UserAccountDataArgs } from 'lendingProtocols/aaveCommon/userAccountData'

export function mapAaveUserAccountData(args: UserAccountDataArgs): Promise<UserAccountData> {
  return getAaveV2UserAccountData(args).then((userAccountDataV2) => ({
    totalCollateral: userAccountDataV2.totalCollateralETH,
    totalDebt: userAccountDataV2.totalDebtETH,
    availableBorrows: userAccountDataV2.availableBorrowsETH,
    currentLiquidationThreshold: userAccountDataV2.currentLiquidationThreshold,
    ltv: userAccountDataV2.ltv,
    healthFactor: userAccountDataV2.healthFactor,
  }))
}
