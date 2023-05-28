import { AaveV3UserAccountData, AaveV3UserAccountDataParameters } from 'blockchain/aave-v3'
import { NetworkIds } from 'blockchain/networks'
import { UserAccountData, UserAccountDataArgs } from 'lendingProtocols/aaveCommon/userAccountData'

export function mapAaveUserAccountData$(
  blockchainCall: (args: AaveV3UserAccountDataParameters) => Promise<AaveV3UserAccountData>,
  args: UserAccountDataArgs & { networkId: NetworkIds.MAINNET },
): Promise<UserAccountData> {
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
