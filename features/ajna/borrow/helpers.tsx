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

export function getAjnaBorrowStatus({
  isStepValid,
  isAllowanceLoading,
  isTxInProgress,
  isTxWaitingForApproval,
  isTxStarted,
  isTxError,
  isOwner,
  currentStep,
  editingStep,
  walletAddress,
  isSimulationLoading,
}: {
  isStepValid: boolean
  isAllowanceLoading: boolean
  isTxInProgress: boolean
  isTxWaitingForApproval: boolean
  isTxStarted: boolean
  isTxError: boolean
  isOwner: boolean
  currentStep: AjnaStatusStep
  editingStep: AjnaEditingStep
  walletAddress?: string
  isSimulationLoading?: boolean
}) {
  const isDisabled =
    !!walletAddress &&
    (!isStepValid ||
      isAllowanceLoading ||
      isSimulationLoading ||
      isTxInProgress ||
      isTxWaitingForApproval)

  const isLoading =
    !!walletAddress &&
    (isAllowanceLoading || isSimulationLoading || isTxInProgress || isTxWaitingForApproval)

  const isButtonHidden = !!(walletAddress && !isOwner && currentStep === editingStep)
  const isTextButtonHidden =
    currentStep === 'transaction' && (!isTxStarted || isTxWaitingForApproval || isTxError)

  return {
    isLoading,
    isDisabled,
    isButtonHidden,
    isTextButtonHidden,
  }
}

export function getPrimaryButtonAction({
  walletAddress,
  currentStep,
  editingStep,
  isTxSuccess,
  flow,
  id,
  buttonDefaultAction,
}: {
  walletAddress?: string
  currentStep: string
  editingStep: string
  isTxSuccess: boolean
  flow: AjnaFlow
  buttonDefaultAction: () => void
  id?: string
}) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return {
        url: '/connect',
      }
    case isTxSuccess && flow === 'open':
      return {
        url: `/ajna/position/${id}`,
      }
    default:
      return {
        action: () => buttonDefaultAction(),
      }
  }
}
