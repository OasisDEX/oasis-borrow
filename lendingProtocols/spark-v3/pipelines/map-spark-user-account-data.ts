import type { NetworkIds } from 'blockchain/networks'
import type { SparkV3UserAccountData, SparkV3UserAccountDataParameters } from 'blockchain/spark-v3'
import type {
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common/aave-like-user-account-data'

export function mapSparkUserAccountData$(
  blockchainCall: (params: SparkV3UserAccountDataParameters) => Promise<SparkV3UserAccountData>,
  args: AaveLikeUserAccountDataArgs & { networkId: NetworkIds.MAINNET },
): Promise<AaveLikeUserAccountData> {
  return blockchainCall(args).then((userAccountData) => {
    return {
      totalCollateral: userAccountData.totalCollateralBase,
      totalDebt: userAccountData.totalDebtBase,
      availableBorrows: userAccountData.availableBorrowsBase,
      currentLiquidationThreshold: userAccountData.currentLiquidationThreshold,
      ltv: userAccountData.ltv,
      healthFactor: userAccountData.healthFactor,
    }
  })
}
