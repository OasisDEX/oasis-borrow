import type { NetworkIds } from 'blockchain/networks'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import type { Trigger } from 'features/positionHistory/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

const getTokenAddresses = (trigger: Trigger) => {
  const debtAddressIndex = trigger.decodedDataNames.findIndex((x) => x === 'debtToken')
  let debtAddress = ''
  if (debtAddressIndex !== -1) {
    debtAddress = trigger.decodedData[debtAddressIndex]
  }

  const collateralAddressIndex = trigger.decodedDataNames.findIndex((x) => x === 'collateralToken')
  let collateralAddress = ''
  if (collateralAddressIndex !== -1) {
    collateralAddress = trigger.decodedData[collateralAddressIndex]
  }
  return { debtAddress, collateralAddress }
}

const getPoolId = (trigger: Trigger) => {
  const poolIdIndex = trigger.decodedDataNames.findIndex((x) => x === 'poolId')
  if (poolIdIndex === -1) {
    return undefined
  }

  return trigger.decodedData[poolIdIndex]
}

const getCloseToCollateral = (trigger: Trigger) => {
  const poolIdIndex = trigger.decodedDataNames.findIndex((x) => x === 'closeToCollateral')
  if (poolIdIndex === -1) {
    return undefined
  }

  return trigger.decodedData[poolIdIndex]
}

/**
 * Returns mapped automation events from automation subgraph per given network id
 *
 * @param networkId - network id of subgraph to be used
 * @param proxy - user dpm proxy address
 * @param collateralTokenAddress - collateral token address that is used in given position
 * @param quoteTokenAddress - quote token address that is used in given position
 *
 * @returns Events mapped to common omni history event interface
 *
 */
export const getAutomationEvents = async ({
  networkId,
  proxy,
  collateralTokenAddress,
  debtTokenAddress,
  poolId,
}: {
  networkId: NetworkIds
  proxy: string
  collateralTokenAddress: string
  debtTokenAddress: string
  poolId?: string
}) => {
  const { response } = (await loadSubgraph({
    subgraph: 'Automation',
    method: 'getAutomationEvents',
    networkId,
    params: {
      dpmProxyAddress: proxy.toLowerCase(),
      collateralAddress: collateralTokenAddress.toLowerCase(),
      debtAddress: debtTokenAddress.toLowerCase(),
    },
  })) as SubgraphsResponses['Automation']['getAutomationEvents']

  // filter events that have the same collateral and debt addresses as addresses in given position
  // to avoid situation that events from for example USDC/ETH will also appear on ETH/USDC position
  const filteredTheSamePairEvents = response.triggerEvents.filter((item) => {
    const { collateralAddress, debtAddress } = getTokenAddresses(item.trigger)
    return collateralAddress === collateralTokenAddress && debtAddress === debtTokenAddress
  })

  // if poolId exists, filter events that belongs to given poolId
  const filteredTheSamePoolIdEvents = filteredTheSamePairEvents.filter((item) => {
    const eventPoolId = getPoolId(item.trigger)

    if (poolId && eventPoolId) {
      return poolId.toLowerCase() === eventPoolId.toLowerCase()
    }

    return true
  })

  const collateralToken = getTokenSymbolBasedOnAddress(networkId, collateralTokenAddress)
  const debtToken = getTokenSymbolBasedOnAddress(networkId, debtTokenAddress)

  return filteredTheSamePoolIdEvents.map((item) => {
    const closeToCollateral = getCloseToCollateral(item.trigger)
    const resolvedCloseToCollateral =
      closeToCollateral === undefined
        ? ''
        : closeToCollateral === 'true'
          ? 'ToCollateral'
          : 'ToDebt'

    return {
      trigger: item.trigger,
      txHash: item.transaction,
      timestamp: Number(item.timestamp) * 1000,
      kind: `Automation${item.eventType}-${item.trigger.simpleName}${resolvedCloseToCollateral}`,
      collateralToken,
      debtToken,
    }
  })
}
