import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

import { SidebarManageBorrowVaultMultiplyTransitionStage } from './SidebarManageBorrowVaultMultiplyTransitionStage'

export function SidebarManageBorrowVault(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()

  const {
    vault: { token },
    toggle,
    stage,
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
        stage: {stage}
        {isMultiplyTransitionStage && (
          <SidebarManageBorrowVaultMultiplyTransitionStage stage={stage} token={token} />
        )}
      </Grid>
    ),
    primaryButton: {
      label: 'Button',
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
