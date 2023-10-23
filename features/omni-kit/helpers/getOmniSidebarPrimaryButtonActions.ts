import type { OmniFlow } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

export function getOmniSidebarPrimaryButtonActions({
  currentStep,
  editingStep,
  flow,
  protocol,
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
  resolvedId,
  product,
  collateralToken,
  quoteToken,
  walletAddress,
  quoteAddress,
  collateralAddress,
  isOracless,
}: {
  currentStep: string
  editingStep: string
  flow: OmniFlow
  protocol: LendingProtocol
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
  product: string
  collateralToken: string
  collateralAddress: string
  quoteToken: string
  quoteAddress: string
  isOracless: boolean
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
        url: `/ethereum/${protocol}/${product}/${resolvedCollateralUrl}-${resolvedQuoteUrl}/${resolvedId}`,
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
