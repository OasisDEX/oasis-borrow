import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarManageBorrowVault(props: ManageStandardBorrowVaultState) {
  const {
    vault: { token },
    toggle,
    stage,
    // isMultiplyTransitionStage,
  } = props

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow: 'manageBorrow', stage, token }),
    dropdown: [
      {
        label: `Manage collateral (${token})`,
        shortLabel: token,
        icon: getToken(token).iconCircle,
        action: () => {
          alert('Dropdown action clicked')
        },
      },
      {
        label: 'Manage DAI',
        shortLabel: 'DAI',
        icon: getToken('DAI').iconCircle,
        action: () => {
          alert('Dropdown action clicked')
        },
      },
      {
        label: 'Switch to multiply',
        action: () => {
          toggle!('multiplyTransitionEditing')
        },
      },
    ],
    content: <Grid gap={3}>stage: {stage}</Grid>,
    primaryButton: {
      label: 'Button',
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
