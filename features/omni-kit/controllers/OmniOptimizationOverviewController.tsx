import { AutoBuyBanner, PartialTakeProfitBanner } from 'features/aave/components/banners'
import { AutoTakeProfitBanner } from 'features/aave/components/banners/auto-take-profit-banner'
import { ConstantMultipleBanner } from 'features/aave/components/banners/constant-multiple-banner'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  OmniAutoBSOverviewDetailsSection,
  OmniPartialTakeProfitOverviewDetailsSection,
} from 'features/omni-kit/automation/components'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniSidebarAutomationStep } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'
import { Card, Grid, Heading } from 'theme-ui'

export const OmniOptimizationOverviewController: FC = () => {
  const {
    environment: { productType, settings, networkId },
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
  const isAutoTakeProfitEnabled = !!automation?.flags.isAutoTakeProfitEnabled
  const isConstantMultipleEnabled = !!automation?.flags.isConstantMultipleEnabled

  const partialTakeProfitDetailsActive =
    state.uiDropdownOptimization === AutomationFeatures.PARTIAL_TAKE_PROFIT
  const autoBuyDetailsActive = state.uiDropdownOptimization === AutomationFeatures.AUTO_BUY

  return (
    <Grid gap={2}>
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
      {(state.uiDropdownOptimization === AutomationFeatures.AUTO_TAKE_PROFIT ||
        isAutoTakeProfitEnabled) && (
        <Card variant="vaultFormContainer" sx={{ p: 2, overflow: 'scroll', height: '200px' }}>
          <Heading variant="h5">Auto Take Profit enabled</Heading>
          <pre style={{ fontSize: '10px' }}>
            {JSON.stringify(automation?.triggers.autoTakeProfit, null, 2)}
          </pre>
        </Card>
      )}
      {(state.uiDropdownOptimization === AutomationFeatures.CONSTANT_MULTIPLE ||
        isConstantMultipleEnabled) && (
        <Card variant="vaultFormContainer" sx={{ p: 2, overflow: 'scroll', height: '200px' }}>
          <Heading variant="h5">Constant Multiple enabled</Heading>
          <pre style={{ fontSize: '10px' }}>
            {JSON.stringify(automation?.triggers.constantMultiple, null, 2)}
          </pre>
        </Card>
      )}
      {/*{ BANNERS }*/}
      {availableAutomations?.includes(AutomationFeatures.PARTIAL_TAKE_PROFIT) &&
        state.uiDropdownOptimization !== AutomationFeatures.PARTIAL_TAKE_PROFIT &&
        !isPartialTakeProfitEnabled && (
          <PartialTakeProfitBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownOptimization', AutomationFeatures.PARTIAL_TAKE_PROFIT)
            }}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.AUTO_BUY) &&
        state.uiDropdownOptimization !== AutomationFeatures.AUTO_BUY &&
        !isAutoBuyEnabled && (
          <AutoBuyBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownOptimization', AutomationFeatures.AUTO_BUY)
            }}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.CONSTANT_MULTIPLE) &&
        state.uiDropdownOptimization !== AutomationFeatures.CONSTANT_MULTIPLE &&
        !isConstantMultipleEnabled && (
          <ConstantMultipleBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownOptimization', AutomationFeatures.CONSTANT_MULTIPLE)
            }}
          />
        )}
      {availableAutomations?.includes(AutomationFeatures.AUTO_TAKE_PROFIT) &&
        state.uiDropdownOptimization !== AutomationFeatures.AUTO_TAKE_PROFIT &&
        !isAutoTakeProfitEnabled && (
          <AutoTakeProfitBanner
            buttonClicked={() => {
              !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
              updateState('uiDropdownOptimization', AutomationFeatures.AUTO_TAKE_PROFIT)
            }}
          />
        )}
    </Grid>
  )
}
