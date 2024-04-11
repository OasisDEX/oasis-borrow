import type { NetworkConfig } from 'blockchain/networks'
import { getOmniPositionUrl } from 'features/omni-kit/helpers'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

interface GetOmniSidebarPrimaryButtonActionsParams {
  collateralAddress: string
  collateralToken: string
  currentStep: string
  editingStep: string
  isOpening: boolean
  isOracless: boolean
  isStepWithTransaction: boolean
  isTransitionAction: boolean
  isTransitionWaitingForApproval: boolean
  isTxSuccess: boolean
  label?: string
  network: NetworkConfig
  onConfirmTransition: () => void
  onDefault: () => void
  onDisconnected: () => void
  onSelectTransition: () => void
  onSwitchNetwork: () => void
  onTransition: () => void
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

export function getOmniSidebarPrimaryButtonActions({
  collateralAddress,
  collateralToken,
  currentStep,
  editingStep,
  isOpening,
  isOracless,
  isStepWithTransaction,
  isTransitionAction,
  isTransitionWaitingForApproval,
  isTxSuccess,
  label,
  network,
  onConfirmTransition,
  onDefault,
  onDisconnected,
  onSelectTransition,
  onSwitchNetwork,
  onTransition,
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
}: GetOmniSidebarPrimaryButtonActionsParams) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { action: onDisconnected }
    case shouldSwitchNetwork && currentStep === editingStep:
      return { action: onSwitchNetwork }
    case isTxSuccess && isOpening:
      return {
        url: getOmniPositionUrl({
          collateralAddress,
          collateralToken,
          isPoolOracless: isOracless,
          label,
          networkName: network.name,
          pairId,
          positionId: openFlowResolvedDpmId,
          productType,
          protocol,
          pseudoProtocol,
          quoteAddress,
          quoteToken: quoteToken,
        }),
      }
    case isStepWithTransaction && isTxSuccess:
      return { action: onUpdated }
    case isTransitionWaitingForApproval:
      return { action: onConfirmTransition }
    case isStepWithTransaction:
      return { action: onSelectTransition }
    case isTransitionAction:
      return { action: onTransition }
    default:
      return { action: onDefault }
  }
}
