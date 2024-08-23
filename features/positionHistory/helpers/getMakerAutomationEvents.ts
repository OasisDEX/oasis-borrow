import type { NetworkIds } from 'blockchain/networks'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

/**
 * Returns mapped automation events from automation subgraph per given network id
 *
 * @param networkId - network id of subgraph to be used
 * @param cdpId - maker cdpId
 * @param collateralTokenAddress - collateral token address that is used in given position
 * @param quoteTokenAddress - quote token address that is used in given position
 *
 * @returns Events mapped to common omni history event interface
 *
 */
export const getMakerAutomationEvents = async ({
  networkId,
  collateralTokenAddress,
  debtTokenAddress,
  cdpId,
}: {
  networkId: NetworkIds
  collateralTokenAddress: string
  debtTokenAddress: string
  cdpId: string
}) => {
  const { response } = (await loadSubgraph({
    subgraph: 'Automation',
    method: 'getMakerAutomationEvents',
    networkId,
    params: { cdpId },
  })) as SubgraphsResponses['Automation']['getMakerAutomationEvents']

  const collateralToken = getTokenSymbolBasedOnAddress(networkId, collateralTokenAddress)
  const debtToken = getTokenSymbolBasedOnAddress(networkId, debtTokenAddress)

  return response.triggerEvents.map((item) => {
    const closeToCollateral = item.trigger.kind === 'StopLossToCollateral'
    const resolvedCloseToCollateral = closeToCollateral ? 'ToCollateral' : 'ToDebt'

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
