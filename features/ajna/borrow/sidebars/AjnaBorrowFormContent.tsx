import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AjnaBorrowFormContentManage } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentSetup } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSetup'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { getPrimaryButtonLabelKey, getTextButtonLabelKey } from 'features/ajna/common/helpers'
import { AjnaBorrowPanel } from 'features/ajna/common/types'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

export function AjnaBorrowFormContent() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, flow, product, quoteToken },
    steps: { currentStep, isStepValid, isStepWithBack, setNextStep, setPrevStep },
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
      <>
        {currentStep === 'risk' && <AjnaBorrowFormContentRisk />}
        {currentStep === 'setup' && <AjnaBorrowFormContentSetup />}
        {currentStep === 'manage' && <AjnaBorrowFormContentManage panel={panel} />}
        {currentStep === 'transaction' && <AjnaBorrowFormContentTransaction />}
      </>
    ),
    primaryButton: {
      label: t(getPrimaryButtonLabelKey({ currentStep, product })),
      disabled: !isStepValid,
      action: setNextStep,
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
