import { getAaveV3UserAccountData } from 'blockchain/aave-v3'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3/aave-v3-supported-network'
import type { NetworkIds } from 'blockchain/networks'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { getSparkV3UserAccountData } from 'blockchain/spark-v3'
import { hasActiveOptimization, hasActiveProtection } from 'features/omni-kit/automation/helpers'
import type { OmniFlowStateFilterParams } from 'features/omni-kit/types'
import { getTriggersRequest } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

export async function aaveLikeFlowStateFilter({
  collateralAddress,
  event,
  allEvents,
  networkId,
  protocol,
  quoteAddress,
  filterConsumed,
}: OmniFlowStateFilterParams & {
  networkId: NetworkIds
}): Promise<boolean> {
  // if event is aave or spark we need to check if there is already additional aave or spark position on given dpm
  // since single dpm can have only 1 aave and 1 spark position
  if (
    ((protocol === LendingProtocol.AaveV3 && event.protocol === LendingProtocol.SparkV3) ||
      (protocol === LendingProtocol.SparkV3 && event.protocol === LendingProtocol.AaveV3)) &&
    !allEvents?.find((item) => item.protocol === protocol)
  ) {
    return Promise.resolve(!!filterConsumed)
  }

  // TODO for now we are reading it on every event that exists for given user
  // we should optimize it by sending only one request with list of dpms prior to flow state filter fn
  const positionTriggers = await getTriggersRequest({
    dpmProxy: event.proxyAddress,
    networkId,
    protocol,
  })
  // if there is triggers we should not allow
  // the user to open a new position with this DPM

  if (
    hasActiveOptimization({ positionTriggers, protocol }) ||
    hasActiveProtection({ positionTriggers, protocol })
  ) {
    return Promise.resolve(!filterConsumed)
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
    const filterValue = userData.totalDebtBase.isZero()

    return filterConsumed ? filterValue : !filterValue
  }

  return Promise.resolve(!filterConsumed)
}
