import { getAaveV2UserAccountData } from 'blockchain/aave'
import type {
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common/aave-like-user-account-data'

export function mapAaveUserAccountData(
  args: AaveLikeUserAccountDataArgs,
): Promise<AaveLikeUserAccountData> {
  return getAaveV2UserAccountData(args).then((userAccountDataV2) => ({
    totalCollateral: userAccountDataV2.totalCollateralETH,
    totalDebt: userAccountDataV2.totalDebtETH,
    availableBorrows: userAccountDataV2.availableBorrowsETH,
    currentLiquidationThreshold: userAccountDataV2.currentLiquidationThreshold,
    ltv: userAccountDataV2.ltv,
    healthFactor: userAccountDataV2.healthFactor,
  }))
}
