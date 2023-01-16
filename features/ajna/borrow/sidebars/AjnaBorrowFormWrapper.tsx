import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormWrapper() {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('ajna.borrow.open.form.title'),
    content: <AjnaBorrowFormContent />,
    primaryButton: {
      label: t('confirm'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
