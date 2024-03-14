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
import type { FC } from 'react'
import React from 'react'
import { Grid } from 'theme-ui'

export const OmniProtectionOverviewController: FC = () => {
  const {
    environment: { productType, settings, networkId },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      automationForm: { state, updateState },
    },
  } = useOmniProductContext(productType)

  const availableAutomations = settings.availableAutomations?.[networkId]

  const isStopLossEnabled = !!automation?.flags.isStopLossEnabled
  const isTrailingStopLossEnabled = !!automation?.flags.isTrailingStopLossEnabled
  const isAutoSellEnabled = !!automation?.flags.isAutoSellEnabled

  const stopLossDetailsActive = state.uiDropdown === AutomationFeatures.STOP_LOSS
  const trailingStopLossDetailsActive = state.uiDropdown === AutomationFeatures.TRAILING_STOP_LOSS
  const autoSellDetailsActive = state.uiDropdown === AutomationFeatures.AUTO_SELL

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
        state.uiDropdown !== AutomationFeatures.AUTO_SELL &&
        !isAutoSellEnabled && (
          <AutoSellBanner
            buttonClicked={() => updateState('uiDropdown', AutomationFeatures.AUTO_SELL)}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.STOP_LOSS) &&
        state.uiDropdown !== AutomationFeatures.STOP_LOSS &&
        !isStopLossEnabled && (
          <StopLossBanner
            buttonClicked={() => updateState('uiDropdown', AutomationFeatures.STOP_LOSS)}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.TRAILING_STOP_LOSS) &&
        state.uiDropdown !== AutomationFeatures.TRAILING_STOP_LOSS &&
        !isTrailingStopLossEnabled && (
          <TrailingStopLossBanner
            buttonClicked={() => updateState('uiDropdown', AutomationFeatures.TRAILING_STOP_LOSS)}
          />
        )}
      {/*{state.uiDropdown === AutomationFeatures.STOP_LOSS &&*/}
      {/*  !protectionControlUI.trailingStopLoss.banner && (*/}
      {/*    <StopLossBanner buttonClicked={goToView('stop-loss')} />*/}
      {/*  )}*/}
      {/*{state.uiDropdown === AutomationFeatures.TRAILING_STOP_LOSS &&*/}
      {/*  !protectionControlUI.stopLoss.banner && (*/}
      {/*    <TrailingStopLossBanner buttonClicked={goToView('trailing-stop-loss')} />*/}
      {/*  )}*/}
      {/*{state.uiDropdown === AutomationFeatures.STOP_LOSS && protectionControlUI.trailingStopLoss.banner && (*/}
      {/*  <StopLossBanner buttonClicked={goToView('stop-loss-selector')} />*/}
      {/*)}*/}
    </Grid>
  )
}
