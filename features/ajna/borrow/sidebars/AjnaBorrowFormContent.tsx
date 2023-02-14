import { getToken } from 'blockchain/tokensMetadata'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { getAjnaBorrowStatus, getPrimaryButtonAction } from 'features/ajna/borrow/helpers'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { getAjnaBorrowValidations } from 'features/ajna/borrow/validations'
import { getPrimaryButtonLabelKey } from 'features/ajna/common/helpers'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
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
    environment: {
      collateralToken,
      flow,
      product,
      quoteToken,
      isOwner,
      collateralBalance,
      ethPrice,
      ethBalance,
      quoteBalance,
    },
    form: {
      dispatch,
      state: { dpmAddress, uiDropdown, depositAmount, paybackAmount },
      updateState,
    },
    steps: { currentStep, editingStep, setNextStep, setStep, isStepWithTransaction, isStepValid },
    tx: { isTxError, isTxSuccess, isTxWaitingForApproval, isTxStarted, isTxInProgress, txDetails },
    position: { id, isSimulationLoading, simulation },
  } = useAjnaBorrowContext()
  const gasEstimation = useGasEstimationContext()

  async function buttonDefaultAction() {
    if (isStepWithTransaction) {
      txHandler()
    } else setNextStep()
  }

  const {
    isPrimaryButtonLoading,
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isTextButtonHidden,
  } = getAjnaBorrowStatus({
    walletAddress,
    isStepValid,
    isAllowanceLoading,
    isSimulationLoading,
    isTxInProgress,
    isTxWaitingForApproval,
    isTxError,
    isTxStarted,
    currentStep,
    editingStep,
    isOwner,
  })

  const { errors } = getAjnaBorrowValidations({
    ethPrice,
    ethBalance,
    gasEstimationUsd: gasEstimation?.usdValue,
    depositAmount,
    paybackAmount,
    quoteBalance,
    collateralBalance,
    simulationErrors: simulation?.errors,
    simulationWarnings: simulation?.errors,
    txError: txDetails?.txError,
    collateralToken,
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
              updateState('uiPill', 'deposit')
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
              updateState('uiPill', 'generate')
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
      label: t(
        getPrimaryButtonLabelKey({
          currentStep,
          product,
          dpmAddress,
          walletAddress,
          isTxSuccess,
          isTxError,
        }),
      ),
      disabled: isPrimaryButtonDisabled || !!errors.messages.length,
      isLoading: isPrimaryButtonLoading,
      hidden: isPrimaryButtonHidden,
      ...getPrimaryButtonAction({
        walletAddress,
        currentStep,
        editingStep,
        isTxSuccess,
        flow,
        id,
        buttonDefaultAction,
      }),
    },
    ...(!isTextButtonHidden && {
      textButton: {
        label: t('back-to-editing'),
        action: () => setStep(editingStep),
      },
    }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
