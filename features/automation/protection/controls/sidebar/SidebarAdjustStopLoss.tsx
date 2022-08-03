import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { commonProtectionDropdownItems } from 'features/automation/protection/common/dropdown'
import { backToVaultOverview } from 'features/automation/protection/common/helpers'
import {
  errorsStopLossValidation,
  warningsStopLossValidation,
} from 'features/automation/protection/common/validation'
import { AdjustSlFormLayoutProps } from 'features/automation/protection/controls/AdjustSlFormLayout'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { extractSidebarTxData } from 'helpers/extractSidebarHelpers'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { SidebarAdjustStopLossAddStage } from './SidebarAdjustStopLossAddStage'
import { SidebarAdjustStopLossEditingStage } from './SidebarAdjustStopLossEditingStage'

export function SidebarAdjustStopLoss(props: AdjustSlFormLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')
  const gasEstimationContext = useGasEstimationContext()

  const {
    addTriggerConfig,
    firstStopLossSetup,
    isProgressDisabled,
    isStopLossEnabled,
    stage,
    toggleForms,
    token,
    slValuePickerConfig,
    selectedSLValue,
    ethBalance,
    ethPrice,
    isAutoSellEnabled,
    isConstantMultipleEnabled,
    txError,
    vault: { debt },
    autoBuyTriggerData,
  } = props

  const flow = firstStopLossSetup ? 'addSl' : 'adjustSl'
  const sidebarTxData = extractSidebarTxData(props)
  const basicBSEnabled = useFeatureToggle('BasicBS')

  const errors = errorsStopLossValidation({
    txError,
    debt,
    stopLossLevel: selectedSLValue,
    autoBuyTriggerData,
  })
  const warnings = warningsStopLossValidation({
    token,
    gasEstimationUsd: gasEstimationContext?.usdValue,
    ethBalance,
    ethPrice,
    sliderMax: slValuePickerConfig.maxBoundry,
    triggerRatio: selectedSLValue,
    isAutoSellEnabled,
    isConstantMultipleEnabled,
  })

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token, isStopLossEnabled }),
    ...(basicBSEnabled && {
      dropdown: {
        forcePanel: 'stopLoss',
        disabled: isDropdownDisabled({ stage }),
        items: commonProtectionDropdownItems(uiChanges, t),
      },
    }),
    content: (
      <Grid gap={3}>
        {stopLossWriteEnabled ? (
          <>
            {(stage === 'stopLossEditing' || stage === 'txFailure') && (
              <SidebarAdjustStopLossEditingStage {...props} errors={errors} warnings={warnings} />
            )}
          </>
        ) : (
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            Due to extreme adversarial market conditions we have currently disabled setting up new
            stop loss triggers, as they might not result in the expected outcome for our users.
            Please use the 'close vault' option if you want to close your vault right now.
          </Text>
        )}
        {(stage === 'txSuccess' || stage === 'txInProgress') && (
          <SidebarAdjustStopLossAddStage {...props} />
        )}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ flow, stage, token }),
      disabled: isProgressDisabled || !!errors.length,
      isLoading: stage === 'txInProgress',
      action: () => {
        if (stage !== 'txSuccess') addTriggerConfig.onClick(() => null)
        else backToVaultOverview(uiChanges)
      },
    },
    ...(!firstStopLossSetup &&
      stage !== 'txInProgress' && {
        textButton: {
          label: t('protection.navigate-cancel'),
          hidden: firstStopLossSetup,
          action: () => toggleForms(),
        },
      }),
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
