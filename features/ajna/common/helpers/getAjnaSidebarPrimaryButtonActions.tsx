import { AjnaFlow } from 'features/ajna/common/types'

export function getAjnaSidebarPrimaryButtonActions({
  currentStep,
  defaultAction,
  editingStep,
  flow,
  resolvedId,
  isTxSuccess,
  walletAddress,
}: {
  currentStep: string
  defaultAction: () => void
  editingStep: string
  flow: AjnaFlow
  resolvedId?: string
  isTxSuccess: boolean
  walletAddress?: string
}) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { url: '/connect' }
    case isTxSuccess && flow === 'open':
      return { url: `/ajna/position/${resolvedId}` }
    default:
      return { action: defaultAction }
  }
}
