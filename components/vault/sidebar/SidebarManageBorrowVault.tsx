import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import React from 'react'

export function SidebarManageBorrowVault(props: ManageStandardBorrowVaultState) {
  const {
    vault: { token },
  } = props

  const sidebarSectionProps: SidebarSectionProps = {
    title: 'Title',
    dropdown: [
      {
        label: `Manage collateral (${token})`,
        shortLabel: token,
        icon: getToken(token).iconCircle,
        panel: 'manage',
      },
      {
        label: 'Manage DAI',
        shortLabel: 'DAI',
        icon: getToken('DAI').iconCircle,
        panel: 'manage',
      },
      {
        label: 'Switch to multiply',
        action: () => {
          alert('Dropdown action clicked')
        },
      },
    ],
    content: [
      {
        panel: 'manage',
        content: <>Content</>,
      },
    ],
    primaryButton: {
      label: 'Button',
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
