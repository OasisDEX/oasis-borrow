import { AutoBuyBanner, PartialTakeProfitBanner } from 'features/aave/components/banners'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  OmniAutoBSOverviewDetailsSection,
  OmniPartialTakeProfitOverviewDetailsSection,
} from 'features/omni-kit/automation/components'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniSidebarAutomationStep } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'
import { Grid, Link } from 'theme-ui'

export const OmniOptimizationOverviewController: FC = () => {
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

  const isPartialTakeProfitEnabled = !!automation?.flags.isPartialTakeProfitEnabled
  const isAutoBuyEnabled = !!automation?.flags.isAutoBuyEnabled

  const partialTakeProfitDetailsActive =
    state.uiDropdownOptimization === AutomationFeatures.PARTIAL_TAKE_PROFIT
  const autoBuyDetailsActive = state.uiDropdownOptimization === AutomationFeatures.AUTO_BUY
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
      {(state.uiDropdownOptimization === AutomationFeatures.PARTIAL_TAKE_PROFIT ||
        isPartialTakeProfitEnabled) && (
        <OmniPartialTakeProfitOverviewDetailsSection active={partialTakeProfitDetailsActive} />
      )}
      {(state.uiDropdownOptimization === AutomationFeatures.AUTO_BUY || isAutoBuyEnabled) && (
        <OmniAutoBSOverviewDetailsSection
          type={AutomationFeatures.AUTO_BUY}
          active={autoBuyDetailsActive}
        />
      )}
      {/*{ BANNERS }*/}
      {availableAutomations?.includes(AutomationFeatures.PARTIAL_TAKE_PROFIT) &&
        state.uiDropdownOptimization !== AutomationFeatures.PARTIAL_TAKE_PROFIT &&
        !isPartialTakeProfitEnabled &&
        !isAave && (
          <PartialTakeProfitBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownOptimization', AutomationFeatures.PARTIAL_TAKE_PROFIT)
            }}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.AUTO_BUY) &&
        state.uiDropdownOptimization !== AutomationFeatures.AUTO_BUY &&
        !isAutoBuyEnabled &&
        !isAave && (
          <AutoBuyBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownOptimization', AutomationFeatures.AUTO_BUY)
            }}
          />
        )}
    </Grid>
  )
}
