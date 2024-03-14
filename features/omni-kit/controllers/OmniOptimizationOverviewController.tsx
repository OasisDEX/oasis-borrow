import { AutoBuyBanner, PartialTakeProfitBanner } from 'features/aave/components/banners'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  OmniAutoBSOverviewDetailsSection,
  OmniPartialTakeProfitOverviewDetailsSection,
} from 'features/omni-kit/automation/components'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { FC } from 'react'
import React from 'react'
import { Grid } from 'theme-ui'

export const OmniOptimizationOverviewController: FC = () => {
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

  const isPartialTakeProfitEnabled = !!automation?.flags.isPartialTakeProfitEnabled
  const isAutoBuyEnabled = !!automation?.flags.isAutoBuyEnabled

  const partialTakeProfitDetailsActive = state.uiDropdown === AutomationFeatures.PARTIAL_TAKE_PROFIT
  const autoBuyDetailsActive = state.uiDropdown === AutomationFeatures.AUTO_BUY

  return (
    <Grid gap={2}>
      {/*{ DETAILS SECTIONS }*/}
      {(state.uiDropdown === AutomationFeatures.PARTIAL_TAKE_PROFIT ||
        isPartialTakeProfitEnabled) && (
        <OmniPartialTakeProfitOverviewDetailsSection active={partialTakeProfitDetailsActive} />
      )}
      {(state.uiDropdown === AutomationFeatures.AUTO_BUY || isAutoBuyEnabled) && (
        <OmniAutoBSOverviewDetailsSection
          type={AutomationFeatures.AUTO_BUY}
          active={autoBuyDetailsActive}
        />
      )}
      {/*{ BANNERS }*/}
      {availableAutomations?.includes(AutomationFeatures.PARTIAL_TAKE_PROFIT) &&
        state.uiDropdown !== AutomationFeatures.PARTIAL_TAKE_PROFIT &&
        !isPartialTakeProfitEnabled && (
          <PartialTakeProfitBanner
            buttonClicked={() => updateState('uiDropdown', AutomationFeatures.PARTIAL_TAKE_PROFIT)}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.AUTO_BUY) &&
        state.uiDropdown !== AutomationFeatures.AUTO_BUY &&
        !isAutoBuyEnabled && (
          <AutoBuyBanner
            buttonClicked={() => updateState('uiDropdown', AutomationFeatures.AUTO_BUY)}
          />
        )}
    </Grid>
  )
}
