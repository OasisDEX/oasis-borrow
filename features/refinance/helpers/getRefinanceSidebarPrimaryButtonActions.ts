import type { NetworkConfig } from 'blockchain/networks'
import { getOmniPositionUrl } from 'features/omni-kit/helpers'
import type { OmniProductType } from 'features/omni-kit/types'
import { RefinanceSidebarStep } from 'features/refinance/types'
import type { LendingProtocol } from 'lendingProtocols'

interface GetRefinanceSidebarPrimaryButtonActionsParams {
  collateralAddress: string
  collateralToken: string
  currentStep: string
  editingStep: string
  isStepWithTransaction: boolean
  isTxSuccess: boolean
  label?: string
  network: NetworkConfig
  onDefault: () => void
  onDisconnected: () => void
  onSelectTransition: () => void
  onSwitchNetwork: () => void
  onUpdated: () => void
  pairId: number
  productType: OmniProductType
  protocol: LendingProtocol
  pseudoProtocol?: string
  quoteAddress: string
  quoteToken: string
  openFlowResolvedDpmId?: string
  shouldSwitchNetwork: boolean
  walletAddress?: string
}

export function getRefinanceSidebarPrimaryButtonActions({
  collateralAddress,
  collateralToken,
  currentStep,
  editingStep,
  isStepWithTransaction,
  isTxSuccess,
  label,
  network,
  onDefault,
  onDisconnected,
  onSelectTransition,
  onSwitchNetwork,
  onUpdated,
  pairId,
  productType,
  protocol,
  pseudoProtocol,
  quoteAddress,
  quoteToken,
  openFlowResolvedDpmId,
  shouldSwitchNetwork,
  walletAddress,
}: GetRefinanceSidebarPrimaryButtonActionsParams) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { action: onDisconnected }
    case shouldSwitchNetwork && currentStep === editingStep:
      return { action: onSwitchNetwork }
    case isTxSuccess && currentStep === RefinanceSidebarStep.Give:
      return { action: onUpdated }
    case isTxSuccess:
      return {
        url: getOmniPositionUrl({
          collateralAddress,
          collateralToken,
          isPoolOracless: false,
          label,
          networkName: network.name,
          pairId,
          positionId: openFlowResolvedDpmId,
          productType,
          protocol,
          pseudoProtocol,
          quoteAddress,
          quoteToken,
        }),
      }
    case isStepWithTransaction && isTxSuccess:
      return { action: onUpdated }
    case isStepWithTransaction:
      return { action: onSelectTransition }
    default:
      return { action: onDefault }
  }
}
