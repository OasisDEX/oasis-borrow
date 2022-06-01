import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { backToVaultOverview } from 'features/automation/protection/common/helpers'
import {
  errorsValidation,
  warningsValidation,
} from 'features/automation/protection/common/validation'
import { CancelSlFormLayoutProps } from 'features/automation/protection/controls/CancelSlFormLayout'
import { SidebarCancelStopLossCancelStage } from 'features/automation/protection/controls/sidebar/SidebarCancelStopLossCancelStage'
import { SidebarCancelStopLossEditingStage } from 'features/automation/protection/controls/sidebar/SidebarCancelStopLossEditingStage'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarProgress } from 'features/sidebar/getSidebarProgress'
import { getSidebarSuccess } from 'features/sidebar/getSidebarSuccess'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarCancelStopLoss(props: CancelSlFormLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  const {
    token,
    txHash,
    removeTriggerConfig,
    ethPrice,
    ilkData,
    etherscan,
    toggleForms,
    selectedSLValue,
    collateralizationRatioAtNextPrice,
    txError,
    gasEstimationUsd,
    ethBalance,
    stage,
    isProgressDisabled,
  } = props

  const flow: SidebarFlow = 'cancelSl'
  const errors = errorsValidation({ txError, selectedSLValue, ilkData })
  const warnings = warningsValidation({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
    selectedSLValue,
    collateralizationRatioAtNextPrice,
  })

  const progress = getSidebarProgress({ stage, openTxHash: txHash, token, etherscan, flow })
  const primaryButtonLabel = getPrimaryButtonLabel({ stage, token, flow })

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {(stage === 'editing' || stage === 'txFailure') && (
          <SidebarCancelStopLossEditingStage {...props} />
        )}
        {(stage === 'txSuccess' || stage === 'txInProgress') && (
          <SidebarCancelStopLossCancelStage {...props} />
        )}
        {stage === 'editing' && stopLossWriteEnabled && (
          <>
            <VaultErrors errorMessages={errors} ilkData={ilkData} />
            <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
          </>
        )}
      </Grid>
    ),
    primaryButton: {
      label: primaryButtonLabel,
      disabled: isProgressDisabled,
      isLoading: stage === 'txInProgress',
      action: () => {
        if (stage !== 'txSuccess') {
          removeTriggerConfig.onClick(() => null)
        } else {
          backToVaultOverview(uiChanges)
        }
      },
    },
    ...(stage !== 'txInProgress' && {
      textButton: {
        label: t('protection.navigate-adjust'),
        action: () => toggleForms(),
      },
    }),
    ...(txHash && {
      progress,
    }),
    success: getSidebarSuccess({ stage, openTxHash: txHash, token, flow, etherscan }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
