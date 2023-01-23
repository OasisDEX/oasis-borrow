import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AjnaBorrowFormContentConfirm } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentConfirm'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentSetup } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSetup'
import { getPrimaryButtonLabelKey } from 'features/ajna/common/helpers'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormContent() {
  const { t } = useTranslation()
  const {
    steps: { currentStep, isStepValid, setNextStep },
  } = useAjnaProductContext()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(`ajna.borrow.open.form.title.${currentStep}`),
    content: (
      <>
        {currentStep === 'risk' && <AjnaBorrowFormContentRisk />}
        {currentStep === 'setup' && <AjnaBorrowFormContentSetup />}
        {currentStep === 'confirm' && <AjnaBorrowFormContentConfirm />}
      </>
    ),
    primaryButton: {
      label: t(getPrimaryButtonLabelKey({ currentStep })),
      disabled: !isStepValid(),
      action: () => {
        if (currentStep === 'confirm') alert('Submit transaction!')
        else setNextStep()
      },
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
