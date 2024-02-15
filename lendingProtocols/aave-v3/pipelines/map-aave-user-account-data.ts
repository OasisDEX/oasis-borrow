import type {
  AaveV3SupportedNetwork,
  AaveV3UserAccountData,
  AaveV3UserAccountDataParameters,
} from 'blockchain/aave-v3'
import type {
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common/aave-like-user-account-data'

export function mapAaveUserAccountData$(
  blockchainCall: (args: AaveV3UserAccountDataParameters) => Promise<AaveV3UserAccountData>,
  args: AaveLikeUserAccountDataArgs & { networkId: AaveV3SupportedNetwork },
): Promise<AaveLikeUserAccountData> {
  return blockchainCall(args).then((userAccountData) => {
    return {
      totalCollateral: userAccountData.totalCollateralBase,
      totalDebt: userAccountData.totalDebtBase,
      availableBorrows: userAccountData.availableBorrowsBase,
      currentLiquidationThreshold: userAccountData.currentLiquidationThreshold,
      ltv: userAccountData.ltv,
      healthFactor: userAccountData.healthFactor,
      address: args.address,
    }
  })
}
