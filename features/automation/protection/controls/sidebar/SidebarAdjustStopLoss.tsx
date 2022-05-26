import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { VaultViewMode } from 'components/VaultTabSwitch'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarProgress } from 'features/sidebar/getSidebarProgress'
import { getSidebarSuccess } from 'features/sidebar/getSidebarSuccess'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import {
  AutomationFromKind,
  PROTECTION_MODE_CHANGE_SUBJECT,
} from '../../common/UITypes/ProtectionFormModeChange'
import { TAB_CHANGE_SUBJECT } from '../../common/UITypes/TabChange'
import { errorsValidation, warningsValidation } from '../../common/validation'
import { AdjustSlFormLayoutProps } from '../AdjustSlFormLayout'
import { SidebarAdjustStopLossAddStage } from './SidebarAdjustStopLossAddStage'
import { SidebarAdjustStopLossEditingStage } from './SidebarAdjustStopLossEditingStage'

export function SidebarAdjustStopLoss(props: AdjustSlFormLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  const {
    token,
    txHash,
    addTriggerConfig,
    ethPrice,
    ilkData,
    etherscan,
    toggleForms,
    selectedSLValue,
    firstStopLossSetup,
    collateralizationRatioAtNextPrice,
    txError,
    gasEstimationUsd,
    ethBalance,
    stage,
    isProgressDisabled,
  } = props

  function backToVaultOverview() {
    uiChanges.publish(TAB_CHANGE_SUBJECT, {
      type: 'change-tab',
      currentMode: VaultViewMode.Overview,
    })
    uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
      currentMode: AutomationFromKind.ADJUST,
      type: 'change-mode',
    })
  }

  const flow = firstStopLossSetup ? 'addSl' : 'adjustSl'
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

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {(stage === 'editing' || stage === 'txFailure') && stopLossWriteEnabled ? (
          <SidebarAdjustStopLossEditingStage {...props} />
        ) : (
          <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
            Due to extreme adversarial market conditions we have currently disabled setting up new
            stop loss triggers, as they might not result in the expected outcome for our users.
            Please use the 'close vault' option if you want to close your vault right now.
          </Text>
        )}
        {(stage === 'txSuccess' || stage === 'txInProgress') && (
          <SidebarAdjustStopLossAddStage {...props} />
        )}
        {stage === 'editing' && !selectedSLValue.isZero() && stopLossWriteEnabled && (
          <>
            <VaultErrors errorMessages={errors} ilkData={ilkData} />
            <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
          </>
        )}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ stage, token, flow }),
      disabled: isProgressDisabled,
      isLoading: stage === 'txInProgress',
      action: () => {
        if (stage !== 'txSuccess') {
          addTriggerConfig.onClick(() => null)
        } else {
          backToVaultOverview()
        }
      },
    },
    ...(!firstStopLossSetup &&
      stage !== 'txInProgress' && {
        textButton: {
          label: t('protection.navigate-cancel'),
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
