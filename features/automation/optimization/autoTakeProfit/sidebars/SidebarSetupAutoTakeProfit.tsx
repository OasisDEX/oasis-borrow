import { Vault } from 'blockchain/vaults'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarAutoTakeProfitEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitEditingStage'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoTakeProfitProps {
  autoBuyTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoTakeProfitActive: boolean
  feature: AutomationFeatures
  vault: Vault
}

export function SidebarSetupAutoTakeProfit({
  autoBuyTriggerData,
  constantMultipleTriggerData,
  isAutoTakeProfitActive,
  feature,
  vault,
}: SidebarSetupAutoTakeProfitProps) {
  const { t } = useTranslation()

  // TODO: TDAutoTakeProfit | replace with sidebarTitle method when data is available
  const sidebarTitle = t(sidebarAutomationFeatureCopyMap[feature])
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Optimization',
    forcePanel: AutomationFeatures.AUTO_TAKE_PROFIT,
    // TODO: TDAutoTakeProfit | replace with isDropdownDisabled method when stage prop is available
    disabled: false,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
    // TODO: TDAutoTakeProfit | to be replaced with data from autoTakeProfitTriggerData
    isAutoTakeProfitEnabled: false,
  })
  // TODO: TDAutoTakeProfit | replace with getAutomationPrimaryButtonLabel method when data is available
  const primaryButtonLabel = 'Temp CTA'

  if (isAutoTakeProfitActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {/* TODO: Should be displayed based on current form state */}
          <SidebarAutoTakeProfitEditingStage vault={vault} />
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
      },
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
