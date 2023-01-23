import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentSetup } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSetup'
import { getPrimaryButtonLabelKey } from 'features/ajna/common/helpers'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormContent() {
  const { t } = useTranslation()
  const {
    steps: { currentStep },
  } = useAjnaProductContext()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(`ajna.borrow.open.form.title.${currentStep}`),
    content: (
      <>
        {currentStep === 'risk' && <AjnaBorrowFormContentRisk />}
        {currentStep === 'setup' && <AjnaBorrowFormContentSetup />}
        {/* TODO: include rest of the steps: risk assesment, proxy, allowance, progress, success, failure  */}
      </>
    ),
    primaryButton: {
      label: t(getPrimaryButtonLabelKey({ currentStep })),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
