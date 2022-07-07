import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { backToVaultOverview } from 'features/automation/protection/common/helpers'
import { CancelSlFormLayoutProps } from 'features/automation/protection/controls/CancelSlFormLayout'
import { SidebarCancelStopLossCancelStage } from 'features/automation/protection/controls/sidebar/SidebarCancelStopLossCancelStage'
import { SidebarCancelStopLossEditingStage } from 'features/automation/protection/controls/sidebar/SidebarCancelStopLossEditingStage'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { extractSidebarTxData } from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarCancelStopLoss(props: CancelSlFormLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const {
    isProgressDisabled,
    removeTriggerConfig,
    stage,
    toggleForms,
    token,
    vault: { debt },
  } = props

  const flow: SidebarFlow = 'cancelSl'
  const sidebarTxData = extractSidebarTxData(props)

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token, debt }),
    content: (
      <Grid gap={3}>
        {(stage === 'editing' || stage === 'txFailure') && (
          <SidebarCancelStopLossEditingStage {...props} />
        )}
        {(stage === 'txSuccess' || stage === 'txInProgress') && (
          <SidebarCancelStopLossCancelStage {...props} />
        )}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ flow, stage, token }),
      disabled: isProgressDisabled,
      isLoading: stage === 'txInProgress',
      action: () => {
        if (stage !== 'txSuccess') removeTriggerConfig.onClick(() => null)
        else backToVaultOverview(uiChanges)
      },
    },
    ...(stage !== 'txInProgress' && {
      textButton: {
        label: t('protection.navigate-adjust'),
        action: () => toggleForms(),
      },
    }),
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
