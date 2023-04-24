import { AjnaFlow } from 'features/ajna/common/types'

export function getAjnaSidebarPrimaryButtonActions({
  currentStep,
  defaultAction,
  editingStep,
  flow,
  isTxSuccess,
  executeConnection,
  walletAddress,
  resolvedId,
}: {
  currentStep: string
  defaultAction: () => void
  editingStep: string
  flow: AjnaFlow
  isTxSuccess: boolean
  executeConnection: () => void
  walletAddress?: string
  resolvedId?: string
}) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { action: executeConnection }
    case isTxSuccess && flow === 'open':
      return { url: `/ajna/position/${resolvedId}` }
    default:
      return { action: defaultAction }
  }
}
