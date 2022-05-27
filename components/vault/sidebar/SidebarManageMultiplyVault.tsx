import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarManageMultiplyVault(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const { stage } = props

  const sidebarSectionProps: SidebarSectionProps = {
    title: 'Title',
    content: <Grid gap={3}>stage: {stage}</Grid>,
    primaryButton: {
      label: 'Button',
      action: () => {},
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
