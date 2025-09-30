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
import { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'
import { Grid, Link } from 'theme-ui'

export const OmniProtectionOverviewController: FC = () => {
  const {
    environment: { productType, settings, networkId, protocol },
    automationSteps: { setStep },
    tx: { isTxInProgress },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      commonForm: { state, updateState },
    },
  } = useOmniProductContext(productType)

  const availableAutomations = settings.availableAutomations?.[networkId]

  const isStopLossEnabled = !!automation?.flags.isStopLossEnabled
  const isTrailingStopLossEnabled = !!automation?.flags.isTrailingStopLossEnabled
  const isAutoSellEnabled = !!automation?.flags.isAutoSellEnabled

  const stopLossDetailsActive = state.uiDropdownProtection === AutomationFeatures.STOP_LOSS
  const trailingStopLossDetailsActive =
    state.uiDropdownProtection === AutomationFeatures.TRAILING_STOP_LOSS
  const autoSellDetailsActive = state.uiDropdownProtection === AutomationFeatures.AUTO_SELL
  const isAave = protocol === LendingProtocol.AaveV3

  return (
    <Grid gap={2}>
      {isAave && (
        <div>
          Due to a recent change in the Aave V3 Smart Contracts, all automations for Aave V3 are
          unable to be triggered. There is no action needed at this time, and new automations will
          be available to migrate to soon. Any questions, please{' '}
          <Link href="https://chat.summer.fi">contact us on Discord.</Link>
        </div>
      )}
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
        !isAutoSellEnabled &&
        !isAave && (
          <AutoSellBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownProtection', AutomationFeatures.AUTO_SELL)
            }}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.STOP_LOSS) &&
        state.uiDropdownProtection !== AutomationFeatures.STOP_LOSS &&
        !isStopLossEnabled &&
        !isAave && (
          <StopLossBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownProtection', AutomationFeatures.STOP_LOSS)
            }}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.TRAILING_STOP_LOSS) &&
        state.uiDropdownProtection !== AutomationFeatures.TRAILING_STOP_LOSS &&
        !isTrailingStopLossEnabled &&
        !isAave && (
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
