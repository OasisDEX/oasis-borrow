import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import {
  getAjnaSidebarButtonsStatus,
  getAjnaSidebarPrimaryButtonActions,
} from 'features/ajna/borrow/helpers'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { getPrimaryButtonLabelKey } from 'features/ajna/common/helpers'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface AjnaBorrowFormContentProps {
  txHandler: () => void
  isAllowanceLoading: boolean
}

export function AjnaBorrowFormContent({
  txHandler,
  isAllowanceLoading,
}: AjnaBorrowFormContentProps) {
  const { t } = useTranslation()
  const { walletAddress } = useAccount()
  const {
    environment: { collateralToken, flow, product, quoteToken, isOwner },
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
    form: {
      dispatch,
      state: { dpmAddress, uiDropdown },
      updateState,
    },
    position: { isSimulationLoading, resolvedId },
    validation: { isFormValid },
  } = useAjnaBorrowContext()

  const {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  } = getAjnaSidebarButtonsStatus({
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
    ...(flow === 'manage' && {
      dropdown: {
        forcePanel: uiDropdown,
        disabled: currentStep !== 'manage',
        items: [
          {
            label: t('system.manage-collateral-token', {
              token: collateralToken,
            }),
            panel: 'collateral',
            shortLabel: collateralToken,
            icon: getToken(collateralToken).iconCircle,
            action: () => {
              dispatch({ type: 'reset' })
              updateState('uiDropdown', 'collateral')
              updateState('uiPill', 'depositBorrow')
            },
          },
          {
            label: t('system.manage-debt-token', {
              token: quoteToken,
            }),
            panel: 'quote',
            shortLabel: quoteToken,
            icon: getToken(quoteToken).iconCircle,
            action: () => {
              dispatch({ type: 'reset' })
              updateState('uiDropdown', 'quote')
              updateState('uiPill', 'generateBorrow')
            },
          },
        ],
      },
    }),
    content: (
      <Grid gap={3}>
        {currentStep === 'risk' && <AjnaBorrowFormContentRisk />}
        {currentStep === 'setup' && <AjnaBorrowFormContentDeposit />}
        {currentStep === 'manage' && <AjnaBorrowFormContentManage />}
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
