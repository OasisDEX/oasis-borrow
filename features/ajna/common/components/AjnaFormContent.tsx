import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  getAjnaSidebarButtonsStatus,
  getAjnaSidebarPrimaryButtonActions,
} from 'features/ajna/borrow/helpers'
import { getPrimaryButtonLabelKey } from 'features/ajna/common/helpers'
import { AjnaBorrowPanel, AjnaEarnPanel } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React, { PropsWithChildren } from 'react'
import { Grid } from 'theme-ui'

export interface AjnaFormContentProps {
  txHandler: () => void
  isAllowanceLoading: boolean
  dpmAddress?: string
  uiDropdown: AjnaBorrowPanel | AjnaEarnPanel
  resolvedId?: string
  isSimulationLoading?: boolean
  isFormValid: boolean
  dropdownItems: {
    label: string
    panel: string
    shortLabel: string
    icon: string
    action: () => void
  }[]
}

export function AjnaFormContent({
  txHandler,
  isAllowanceLoading,
  children,
  dpmAddress,
  uiDropdown,
  resolvedId,
  isSimulationLoading,
  isFormValid,
  dropdownItems,
}: PropsWithChildren<AjnaFormContentProps>) {
  const { t } = useTranslation()
  const { walletAddress } = useAccount()
  const {
    environment: { flow, product, isOwner, quoteToken, collateralToken },
    steps: { currentStep, editingStep, setNextStep, setStep, isStepWithTransaction },
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
    title: t(`ajna.${product}.common.form.title.${currentStep}`, { quoteToken, collateralToken }),
    ...(flow === 'manage' && {
      dropdown: {
        forcePanel: uiDropdown,
        disabled: currentStep !== 'manage',
        items: dropdownItems,
      },
    }),
    content: <Grid gap={3}>{children}</Grid>,
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
