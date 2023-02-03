import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { useAjnaTxHandler } from 'features/ajna/borrow/useAjnaTxHandler'
import { getPrimaryButtonLabelKey, getTextButtonLabelKey } from 'features/ajna/common/helpers'
import { AjnaBorrowPanel } from 'features/ajna/common/types'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

export function AjnaBorrowFormContent() {
  const { t } = useTranslation()
  const { walletAddress } = useAccount()
  const {
    environment: { collateralToken, flow, product, quoteToken },
    form: {
      state: { action },
    },
    steps: {
      currentStep,
      editingStep,
      isStepValid,
      isStepWithBack,
      setNextStep,
      setPrevStep,
      setStep,
    },
  } = useAjnaBorrowContext()

  // TODO use here proxyAddress from DPM state machine
  const txHandler = useAjnaTxHandler({ proxyAddress: '0xF5C0D205a00A5F799E3CFC4AC2E71C326Dd12b76' })
  const [panel, setPanel] = useState<AjnaBorrowPanel>('collateral')

  useEffect(() => {
    if (!walletAddress && currentStep !== 'risk') setStep(editingStep)
  }, [walletAddress])

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
      label: t(getPrimaryButtonLabelKey({ currentStep, product, walletAddress })),
      disabled: !!walletAddress && !isStepValid,
      ...(!walletAddress && currentStep === editingStep
        ? {
            url: '/connect',
          }
        : {
            action: async () => {
              setNextStep()
              if (action) {
                txHandler()
              }
            },
          }),
    },
    ...(isStepWithBack && {
      textButton: {
        label: t(getTextButtonLabelKey({ currentStep, product })),
        action: setPrevStep,
      },
    }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
