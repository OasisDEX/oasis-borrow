import type {
  SparkV3SupportedNetwork,
  SparkV3UserAccountData,
  SparkV3UserAccountDataParameters,
} from 'blockchain/spark-v3'
import type {
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common/aave-like-user-account-data'

export function mapSparkUserAccountData$(
  blockchainCall: (params: SparkV3UserAccountDataParameters) => Promise<SparkV3UserAccountData>,
  args: AaveLikeUserAccountDataArgs & { networkId: SparkV3SupportedNetwork },
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
