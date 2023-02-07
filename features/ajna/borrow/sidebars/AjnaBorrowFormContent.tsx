import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { getPrimaryButtonLabelKey } from 'features/ajna/common/helpers'
import { AjnaBorrowPanel } from 'features/ajna/common/types'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Grid } from 'theme-ui'

interface AjnaBorrowFormContentProps {
  isAllowanceLoading?: boolean
}

export function AjnaBorrowFormContent({ isAllowanceLoading }: AjnaBorrowFormContentProps) {
  const { t } = useTranslation()
  const { walletAddress } = useAccount()
  const {
    environment: { collateralToken, flow, product, quoteToken },
    form: {
      state: { dpmAddress },
    },
    steps: { currentStep, editingStep, isStepValid, setNextStep, setStep },
    tx: { isTxStarted, isTxError, isTxWaitingForApproval },
  } = useAjnaBorrowContext()

  const [panel, setPanel] = useState<AjnaBorrowPanel>('collateral')

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(`ajna.${product}.common.form.title.${currentStep}`),
    ...(flow === 'manage' && {
      dropdown: {
        disabled: currentStep !== 'manage',
        items: [
          {
            label: t('system.manage-collateral-token', { token: collateralToken }),
            shortLabel: collateralToken,
            icon: getToken(collateralToken).iconCircle,
            action: () => setPanel('collateral'),
          },
          {
            label: t('system.manage-debt-token', { token: quoteToken }),
            shortLabel: quoteToken,
            icon: getToken(quoteToken).iconCircle,
            action: () => setPanel('quote'),
          },
        ],
      },
    }),
    content: (
      <Grid gap={3}>
        {currentStep === 'risk' && <AjnaBorrowFormContentRisk />}
        {currentStep === 'setup' && <AjnaBorrowFormContentDeposit />}
        {currentStep === 'manage' && <AjnaBorrowFormContentManage panel={panel} />}
        {currentStep === 'transaction' && <AjnaBorrowFormContentTransaction />}
      </Grid>
    ),
    primaryButton: {
      label: t(getPrimaryButtonLabelKey({ currentStep, product, dpmAddress, walletAddress })),
      disabled: !!walletAddress && (!isStepValid || isAllowanceLoading),
      isLoading: !!walletAddress && isAllowanceLoading,
      ...(!walletAddress && currentStep === editingStep
        ? {
            url: '/connect',
          }
        : { action: setNextStep }),
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
