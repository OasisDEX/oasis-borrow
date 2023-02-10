import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { getPrimaryButtonLabelKey } from 'features/ajna/common/helpers'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface AjnaBorrowFormContentProps {
  txHandler: () => void
  isAllowanceLoading?: boolean
}

export function AjnaBorrowFormContent({
  isAllowanceLoading,
  txHandler,
}: AjnaBorrowFormContentProps) {
  const { t } = useTranslation()
  const { walletAddress } = useAccount()
  const {
    environment: { collateralToken, isOwner, flow, product, quoteToken },
    form: {
      dispatch,
      state: { dpmAddress, uiDropdown },
      updateState,
    },
    steps: { currentStep, editingStep, isStepValid, setNextStep, setStep, isStepWithTransaction },
    tx: { isTxStarted, isTxError, isTxWaitingForApproval, isTxSuccess, isTxInProgress },
    position: { isSimulationLoading, id },
  } = useAjnaBorrowContext()

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
      disabled:
        !!walletAddress &&
        (!isStepValid ||
          isAllowanceLoading ||
          isSimulationLoading ||
          isTxInProgress ||
          isTxWaitingForApproval),
      isLoading:
        !!walletAddress &&
        (isAllowanceLoading || isSimulationLoading || isTxInProgress || isTxWaitingForApproval),
      ...(!walletAddress && currentStep === editingStep
        ? {
            url: '/connect',
          }
        : isTxSuccess && id
        ? {
            url: `/ajna/position/${id}`,
          }
        : {
            action: async () => {
              if (isStepWithTransaction) {
                txHandler()
              } else setNextStep()
            },
          }),
      ...(walletAddress && !isOwner && currentStep === editingStep && { hidden: true }),
    },
    // TODO: think of a smart way of managing if this button should be visible
    ...(currentStep === 'transaction' &&
      (!isTxStarted || isTxWaitingForApproval || isTxError) && {
        textButton: {
          label: t('back-to-editing'),
          action: () => setStep(editingStep),
        },
      }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
