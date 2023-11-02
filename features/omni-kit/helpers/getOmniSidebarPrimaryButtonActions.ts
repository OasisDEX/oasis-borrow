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
}: GetOmniSidebarPrimaryButtonActionsParams) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { action: onDisconnected }
    case isTxSuccess && isOpening:
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
