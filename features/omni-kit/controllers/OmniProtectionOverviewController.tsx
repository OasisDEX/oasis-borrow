import {
  AutoSellBanner,
  StopLossBanner,
  TrailingStopLossBanner,
} from 'features/aave/components/banners'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  OmniAutoBSOverviewDetailsSection,
  OmniStopLossOverviewDetailsSection,
  OmniTrailingStopLossOverviewDetailsSection,
} from 'features/omni-kit/automation/components'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniSidebarAutomationStep } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'
import { Grid } from 'theme-ui'

export const OmniProtectionOverviewController: FC = () => {
  const {
    environment: { productType },
    automationSteps: { setStep },
    tx: { isTxInProgress },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      availableAutomations,
      commonForm: { state, updateState },
    },
  } = useOmniProductContext(productType)

  const isStopLossEnabled = !!automation?.flags.isStopLossEnabled
  const isTrailingStopLossEnabled = !!automation?.flags.isTrailingStopLossEnabled
  const isAutoSellEnabled = !!automation?.flags.isAutoSellEnabled

  const stopLossDetailsActive = state.uiDropdownProtection === AutomationFeatures.STOP_LOSS
  const trailingStopLossDetailsActive =
    state.uiDropdownProtection === AutomationFeatures.TRAILING_STOP_LOSS
  const autoSellDetailsActive = state.uiDropdownProtection === AutomationFeatures.AUTO_SELL

  return (
    <Grid gap={2}>
      {/*{ DETAILS SECTIONS }*/}
      {(stopLossDetailsActive || isStopLossEnabled) && (
        <OmniStopLossOverviewDetailsSection active={stopLossDetailsActive} />
      )}
      {(trailingStopLossDetailsActive || isTrailingStopLossEnabled) && (
        <OmniTrailingStopLossOverviewDetailsSection active={trailingStopLossDetailsActive} />
      )}
      {(autoSellDetailsActive || isAutoSellEnabled) && (
        <OmniAutoBSOverviewDetailsSection
          active={autoSellDetailsActive}
          type={AutomationFeatures.AUTO_SELL}
        />
      )}
      {/*{ BANNERS }*/}
      {availableAutomations?.includes(AutomationFeatures.AUTO_SELL) &&
        state.uiDropdownProtection !== AutomationFeatures.AUTO_SELL &&
        !isAutoSellEnabled && (
          <AutoSellBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownProtection', AutomationFeatures.AUTO_SELL)
            }}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.STOP_LOSS) &&
        state.uiDropdownProtection !== AutomationFeatures.STOP_LOSS &&
        !isStopLossEnabled && (
          <StopLossBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownProtection', AutomationFeatures.STOP_LOSS)
            }}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.TRAILING_STOP_LOSS) &&
        state.uiDropdownProtection !== AutomationFeatures.TRAILING_STOP_LOSS &&
        !isTrailingStopLossEnabled && (
          <TrailingStopLossBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownProtection', AutomationFeatures.TRAILING_STOP_LOSS)
            }}
          />
        )}
    </Grid>
  )
}
