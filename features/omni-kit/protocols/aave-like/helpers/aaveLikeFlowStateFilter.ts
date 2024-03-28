import { getAaveV3UserAccountData } from 'blockchain/aave-v3'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3/aave-v3-supported-network'
import type { NetworkIds } from 'blockchain/networks'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { getSparkV3UserAccountData } from 'blockchain/spark-v3'
import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import type { OmniFlowStateFilterParams } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'

export async function aaveLikeFlowStateFilter({
  event,
  collateralAddress,
  quoteAddress,
  protocol,
  networkId,
}: OmniFlowStateFilterParams & {
  networkId: NetworkIds
}): Promise<boolean> {
  if (
    extractLendingProtocolFromPositionCreatedEvent(event) === protocol &&
    collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase()
  ) {
    return Promise.resolve(false)
  }
  const userData =
    protocol === LendingProtocol.AaveV3
      ? await getAaveV3UserAccountData({
          address: event.args.proxyAddress,
          networkId: networkId as AaveV3SupportedNetwork,
        })
      : await getSparkV3UserAccountData({
          address: event.args.proxyAddress,
          networkId: networkId as SparkV3SupportedNetwork,
        })
  return userData.totalDebtBase.isZero()
}
