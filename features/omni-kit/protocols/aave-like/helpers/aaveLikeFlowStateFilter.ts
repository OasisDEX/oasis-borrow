import { getAaveV3UserAccountData } from 'blockchain/aave-v3'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3/aave-v3-supported-network'
import type { NetworkIds } from 'blockchain/networks'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { getSparkV3UserAccountData } from 'blockchain/spark-v3'
import type { OmniFlowStateFilterParams } from 'features/omni-kit/types'
import type { GetTriggersResponse } from 'helpers/triggers'
import { LendingProtocol } from 'lendingProtocols'

export async function aaveLikeFlowStateFilter({
  collateralAddress,
  event,
  filterConsumed,
  networkId,
  protocol,
  quoteAddress,
  positionTriggers,
}: OmniFlowStateFilterParams & {
  networkId: NetworkIds
  positionTriggers?: GetTriggersResponse
}): Promise<boolean> {
  const positionTriggersBooleanList =
    positionTriggers?.triggers &&
    Object.keys(positionTriggers.triggers).map(
      (trigger) => positionTriggers.triggers[trigger as keyof GetTriggersResponse['triggers']],
    )

  if (positionTriggersBooleanList?.some((trigger) => trigger)) {
    return Promise.resolve(false)
  }

  // if its spark/aave we need to check that because we cant mix them
  if (
    (protocol === LendingProtocol.AaveV3 && event.protocol === LendingProtocol.SparkV3) ||
    (protocol === LendingProtocol.SparkV3 && event.protocol === LendingProtocol.AaveV3)
  ) {
    return Promise.resolve(false)
  }
  if (
    event.protocol === protocol &&
    collateralAddress.toLowerCase() === event.collateralTokenAddress.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.debtTokenAddress.toLowerCase()
  ) {
    const userData =
      protocol === LendingProtocol.AaveV3
        ? await getAaveV3UserAccountData({
            address: event.proxyAddress,
            networkId: networkId as AaveV3SupportedNetwork,
          })
        : await getSparkV3UserAccountData({
            address: event.proxyAddress,
            networkId: networkId as SparkV3SupportedNetwork,
          })
    return !!filterConsumed && userData.totalDebtBase.isZero()
  }
  return Promise.resolve(false)
}
