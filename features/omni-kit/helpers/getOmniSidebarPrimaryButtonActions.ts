import type { OmniFlow } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

export function getOmniSidebarPrimaryButtonActions({
  collateralAddress,
  collateralToken,
  currentStep,
  editingStep,
  flow,
  isOracless,
  isStepWithTransaction,
  isTransitionAction,
  isTransitionWaitingForApproval,
  isTxSuccess,
  onConfirmTransition,
  onDefault,
  onDisconnected,
  onSelectTransition,
  onTransition,
  onUpdated,
  productType,
  protocol,
  quoteAddress,
  quoteToken,
  resolvedId,
  walletAddress,
}: {
  collateralAddress: string
  collateralToken: string
  currentStep: string
  editingStep: string
  flow: OmniFlow
  isOracless: boolean
  isStepWithTransaction: boolean
  isTransitionAction: boolean
  isTransitionWaitingForApproval: boolean
  isTxSuccess: boolean
  onConfirmTransition: () => void
  onDefault: () => void
  onDisconnected: () => void
  onSelectTransition: () => void
  onTransition: () => void
  onUpdated: () => void
  productType: string
  protocol: LendingProtocol
  quoteAddress: string
  quoteToken: string
  resolvedId?: string
  walletAddress?: string
}) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { action: onDisconnected }
    case isTxSuccess && flow === 'open':
      const resolvedCollateralUrl = isOracless ? collateralAddress : collateralToken
      const resolvedQuoteUrl = isOracless ? quoteAddress : quoteToken
      return {
        url: `/ethereum/${protocol}/${productType.toLowerCase()}/${resolvedCollateralUrl}-${resolvedQuoteUrl}/${resolvedId}`,
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
