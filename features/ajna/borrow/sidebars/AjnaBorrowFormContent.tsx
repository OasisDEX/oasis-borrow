import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentSetup } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSetup'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { getPrimaryButtonLabelKey, getTextButtonLabelKey } from 'features/ajna/common/helpers'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormContent() {
  const { t } = useTranslation()
  const {
    environment: { product },
    steps: { currentStep, isStepValid, isStepWithBack, setNextStep, setPrevStep },
  } = useAjnaBorrowContext()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(`ajna.${product}.open.form.title.${currentStep}`),
    content: (
      <>
        {currentStep === 'risk' && <AjnaBorrowFormContentRisk />}
        {currentStep === 'setup' && <AjnaBorrowFormContentSetup />}
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
