
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  getAjnaSidebarButtonsStatus,
  getAjnaSidebarPrimaryButtonActions,
} from 'features/ajna/borrow/helpers'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { getPrimaryButtonLabelKey } from 'features/ajna/common/helpers'
import { AjnaStatusStep } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAjnaEarnContext } from 'features/ajna/earn/contexts/AjnaEarnContext'
import { AjnaEarnFormContentDeposit } from 'features/ajna/earn/sidebars/AjnaEarnFormContentDeposit'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface AjnaEarnFormContentProps {
  txHandler: () => void
  isAllowanceLoading: boolean
}

// TODO potentially could be extracted as wrapper for earn and borrow form contents
export function AjnaEarnFormContent({ txHandler, isAllowanceLoading }: AjnaEarnFormContentProps) {
  const { t } = useTranslation()
  const { walletAddress } = useAccount()
  const {
    environment: { flow, product, isOwner },
    steps: { editingStep, setNextStep, setStep, isStepWithTransaction },
    tx: {
      isTxError,
      isTxSuccess,
      isTxWaitingForApproval,
      isTxStarted,
      isTxInProgress,
      setTxDetails,
    },
  } = useAjnaProductContext()
  const {
    form: {
      state: { dpmAddress },
    },
    position: { resolvedId, isSimulationLoading },
    validation: { isFormValid },
  } = useAjnaEarnContext()

  const currentStep = 'setup' as AjnaStatusStep

  const {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  } = getAjnaSidebarButtonsStatus({
    currentStep,
    editingStep,
    isAllowanceLoading,
    isOwner,
    isSimulationLoading,
    isFormValid,
    isTxError,
    isTxInProgress,
    isTxStarted,
    isTxWaitingForApproval,
    walletAddress,
  })
  const primaryButtonLabel = getPrimaryButtonLabelKey({
    flow,
    currentStep,
    product,
    dpmAddress,
    walletAddress,
    isTxSuccess,
    isTxError,
  })
  const primaryButtonActions = getAjnaSidebarPrimaryButtonActions({
    defaultAction: async () => {
      if (isStepWithTransaction) {
        if (isTxSuccess) {
          setTxDetails(undefined)
          setStep(editingStep)
        } else txHandler()
      } else setNextStep()
    },
    currentStep,
    editingStep,
    flow,
    resolvedId,
    isTxSuccess,
    walletAddress,
  })

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(`ajna.${product}.common.form.title.${currentStep}`),
    content: (
      <Grid gap={3}>
        {currentStep === 'risk' && <AjnaBorrowFormContentRisk />}
        {currentStep === 'setup' && <AjnaEarnFormContentDeposit />}
        {currentStep === 'transaction' && <AjnaBorrowFormContentTransaction />}
      </Grid>
    ),
    primaryButton: {
      label: t(primaryButtonLabel),
      disabled: isPrimaryButtonDisabled,
      isLoading: isPrimaryButtonLoading,
      hidden: isPrimaryButtonHidden,
      ...primaryButtonActions,
    },
    textButton: {
      label: t('back-to-editing'),
      action: () => setStep(editingStep),
      hidden: isTextButtonHidden,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
