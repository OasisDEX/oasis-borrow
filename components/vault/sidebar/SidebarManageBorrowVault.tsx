import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

import { SidebarManageBorrowVaultEditingStage } from './SidebarManageBorrowVaultEditingStage'
import { SidebarManageBorrowVaultTransitionStage } from './SidebarManageBorrowVaultTransitionStage'

export function SidebarManageBorrowVault(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()

  const {
    vault: { token },
    toggle,
    stage,
    isEditingStage,
    isMultiplyTransitionStage,
  } = props
  const [forcePanel, setForcePanel] = useState<string>()

  useEffect(() => {
    switch (stage) {
      case 'collateralEditing':
        setForcePanel('collateral')
        break
      case 'daiEditing':
        setForcePanel('dai')
        break
      case 'multiplyTransitionEditing':
        setForcePanel('transition')
        break
    }
  }, [stage])

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow: 'manageBorrow', stage, token }),
    forcePanel,
    dropdown: [
      {
        label: t('system.actions.borrow.edit-collateral', { token }),
        shortLabel: token,
        icon: getToken(token).iconCircle,
        panel: 'collateral',
        action: () => {
          toggle!('collateralEditing')
        },
      },
      {
        label: t('system.actions.borrow.edit-dai'),
        shortLabel: 'DAI',
        icon: getToken('DAI').iconCircle,
        panel: 'dai',
        action: () => {
          toggle!('daiEditing')
        },
      },
      {
        label: t('system.actions.borrow.switch-to-multiply'),
        panel: 'transition',
        action: () => {
          toggle!('multiplyTransitionEditing')
        },
      },
    ],
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarManageBorrowVaultEditingStage {...props} />}
        {isMultiplyTransitionStage && (
          <SidebarManageBorrowVaultTransitionStage stage={stage} token={token} />
        )}
        <VaultErrors {...props} />
        <VaultWarnings {...props} />
      </Grid>
    ),
    primaryButton: {
      label: 'Button',
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
