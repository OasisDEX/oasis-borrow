import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { extractPrimaryButtonLabelParams } from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

export function SidebarManageMultiplyVault(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    stage,
    otherAction,
    toggle,
    setOtherAction,
    canProgress,
    accountIsConnected,
    vault: { token },
  } = props

  const [forcePanel, setForcePanel] = useState<string>()
  const flow: SidebarFlow = 'manageMultiply'
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)

  useEffect(() => {
    switch (stage) {
      case 'adjustPosition':
        setForcePanel('adjust')
        break
      case 'otherActions':
        if (['depositDai', 'paybackDai', 'withdrawDai'].includes(otherAction)) setForcePanel('dai')
        else if (['depositCollateral', 'withdrawCollateral'].includes(otherAction))
          setForcePanel('collateral')
        else if (otherAction === 'closeVault') setForcePanel('close')
        break
      case 'borrowTransitionEditing':
        setForcePanel('transition')
        break
    }
  }, [stage, otherAction])

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    dropdown: {
      forcePanel,
      disabled: isDropdownDisabled({ stage }),
      items: [
        {
          label: t('system.actions.multiply.adjust'),
          icon: 'circle_slider',
          iconShrink: 2,
          panel: 'adjust',
          action: () => {
            toggle!('adjustPosition')
          },
        },
        {
          label: t('system.actions.borrow.edit-collateral', { token }),
          shortLabel: token,
          icon: getToken(token).iconCircle,
          panel: 'collateral',
          action: () => {
            toggle!('otherActions')
            setOtherAction!('depositCollateral')
          },
        },
        {
          label: t('system.actions.borrow.edit-dai'),
          shortLabel: 'DAI',
          icon: getToken('DAI').iconCircle,
          panel: 'dai',
          action: () => {
            toggle!('otherActions')
            setOtherAction!('depositDai')
          },
        },
        {
          label: t('system.actions.multiply.switch-to-borrow'),
          icon: 'circle_exchange',
          iconShrink: 2,
          panel: 'transition',
          action: () => {
            toggle!('borrowTransitionEditing')
          },
        },
        {
          label: t('system.actions.common.close-vault'),
          icon: 'circle_close',
          iconShrink: 2,
          panel: 'close',
          action: () => {
            toggle!('otherActions')
            setOtherAction!('closeVault')
          },
        },
      ],
    },
    content: <Grid gap={3}>stage: {stage}<br />other: {otherAction}</Grid>,
    primaryButton: {
      label: getPrimaryButtonLabel(primaryButtonLabelParams),
      disabled: !canProgress || !accountIsConnected,
      action: () => {},
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
