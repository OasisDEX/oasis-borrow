import type { ProtocolFlow } from 'features/unifiedProtocol/types'

export function getAjnaSidebarPrimaryButtonActions({
  currentStep,
  editingStep,
  flow,
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
  flow: ProtocolFlow
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
        url: `/ethereum/ajna/${product}/${resolvedCollateralUrl}-${resolvedQuoteUrl}/${resolvedId}`,
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
