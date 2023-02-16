import { AjnaEditingStep, AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import { useTranslation } from 'next-i18next'

interface AjnaBorrowHeadlinePropsParams {
  collateralToken?: string
  flow: AjnaFlow
  id?: string
  product?: AjnaProduct
  quoteToken?: string
}

export function getAjnaBorrowHeadlineProps({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
}: AjnaBorrowHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken && {
        header: t(`ajna.${product}.${flow}.headline.header`, { collateralToken, id, quoteToken }),
        token: [collateralToken, quoteToken],
        label: '/static/img/ajna-product-card-label.svg',
      }),
  }
}

export function getAjnaSidebarButtonsStatus({
  currentStep,
  editingStep,
  isAllowanceLoading,
  isFormValid,
  isOwner,
  isSimulationLoading,
  isTxError,
  isTxInProgress,
  isTxStarted,
  isTxWaitingForApproval,
  walletAddress,
}: {
  currentStep: AjnaStatusStep
  editingStep: AjnaEditingStep
  isAllowanceLoading: boolean
  isFormValid: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxWaitingForApproval: boolean
  walletAddress?: string
}) {
  const isPrimaryButtonDisabled =
    !!walletAddress &&
    (!isFormValid ||
      isAllowanceLoading ||
      isSimulationLoading ||
      isTxInProgress ||
      isTxWaitingForApproval)

  const isPrimaryButtonLoading =
    !!walletAddress &&
    (isAllowanceLoading || isSimulationLoading || isTxInProgress || isTxWaitingForApproval)

  const isPrimaryButtonHidden = !!(walletAddress && !isOwner && currentStep === editingStep)
  const isTextButtonHidden = !(currentStep === 'transaction' && (!isTxStarted || isTxError))

  return {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  }
}

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
