import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export const otherActionsCollateralPanel = ['depositCollateral', 'withdrawCollateral']
export const otherActionsDaiPanel = ['depositDai', 'paybackDai', 'withdrawDai']

export function SidebarManageGuniVault(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {} = props

  const sidebarSectionProps: SidebarSectionProps = {
    title: 'Title',
    content: <Grid gap={3}>a</Grid>,
    primaryButton: {
      label: 'a',
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
