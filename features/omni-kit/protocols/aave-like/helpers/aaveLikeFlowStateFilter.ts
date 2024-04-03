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
  filterConsumed,
}: OmniFlowStateFilterParams & {
  networkId: NetworkIds
}): Promise<boolean> {
  // if its spark/aave we need to check that because we cant mix them
  if (
    (protocol === LendingProtocol.AaveV3 &&
      extractLendingProtocolFromPositionCreatedEvent(event.args.protocol) ===
        LendingProtocol.SparkV3) ||
    (protocol === LendingProtocol.SparkV3 &&
      extractLendingProtocolFromPositionCreatedEvent(event.args.protocol) ===
        LendingProtocol.AaveV3)
  ) {
    return Promise.resolve(false)
  }
  if (
    extractLendingProtocolFromPositionCreatedEvent(event.args.protocol) === protocol &&
    collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase()
  ) {
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
    return !!filterConsumed && userData.totalDebtBase.isZero()
  }
  return Promise.resolve(false)
}
