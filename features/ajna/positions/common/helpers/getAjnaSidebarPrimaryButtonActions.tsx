import { AjnaFlow } from 'features/ajna/common/types'

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
}: {
  currentStep: string
  editingStep: string
  flow: AjnaFlow
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
  quoteToken: string
  resolvedId?: string
  walletAddress?: string
}) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { action: onDisconnected }
    case isTxSuccess && flow === 'open':
      return { url: `/ethereum/ajna/${product}/${collateralToken}-${quoteToken}/${resolvedId}` }
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
