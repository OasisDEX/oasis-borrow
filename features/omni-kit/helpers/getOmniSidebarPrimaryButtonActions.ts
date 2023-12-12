import type { NetworkConfig } from 'blockchain/networks'
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
  network: NetworkConfig
  onConfirmTransition: () => void
  onDefault: () => void
  onDisconnected: () => void
  onSelectTransition: () => void
  onSwitchNetwork: () => void
  onTransition: () => void
  onUpdated: () => void
  productType: OmniProductType
  protocol: LendingProtocol
  quoteAddress: string
  quoteToken: string
  resolvedId?: string
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
  network,
  onConfirmTransition,
  onDefault,
  onDisconnected,
  onSelectTransition,
  onSwitchNetwork,
  onTransition,
  onUpdated,
  productType,
  protocol,
  quoteAddress,
  quoteToken,
  resolvedId,
  shouldSwitchNetwork,
  walletAddress,
}: GetOmniSidebarPrimaryButtonActionsParams) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { action: onDisconnected }
    case shouldSwitchNetwork && currentStep === editingStep:
      return { action: onSwitchNetwork }
    case isTxSuccess && isOpening:
      const resolvedCollateralUrl = isOracless ? collateralAddress : collateralToken
      const resolvedQuoteUrl = isOracless ? quoteAddress : quoteToken
      return {
        url: `/${network.name}/${protocol}/${productType}/${resolvedCollateralUrl}-${resolvedQuoteUrl}/${resolvedId}`,
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
