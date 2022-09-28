import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarAutoTakeProfitEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitEditingStage'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from '../state/autoTakeProfitFormChange'

interface SidebarSetupAutoTakeProfitProps {
  autoTakeProfitState: AutoTakeProfitFormChange
  autoBuyTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoTakeProfitActive: boolean
  feature: AutomationFeatures
  vault: Vault
  closePickerConfig: PickCloseStateProps
}
// TODO ŁW Slider config
export function SidebarSetupAutoTakeProfit({
  autoTakeProfitState,
  autoBuyTriggerData,
  constantMultipleTriggerData,
  isAutoTakeProfitActive,
  feature,
  vault,
  closePickerConfig,
}: SidebarSetupAutoTakeProfitProps) {
  const { uiChanges } = useAppContext()
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

  const autoTakeSliderBasicConfig = {
    disabled: false,
    leftBoundryFormatter: (x: BigNumber) =>
      x.isZero() ? '-' : '$ ' + formatAmount(x, vault.token),
    rightBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x)),
    step: 1,
  }

  const sliderPercentageFill = new BigNumber(1025.0)
  const min = new BigNumber(100)
  const max = new BigNumber(10000)
  const maxBoundry = new BigNumber(max.multipliedBy(100).toFixed(0, BigNumber.ROUND_DOWN))

  // TODO ŁW slider % fill based on selected price
  // const sliderPercentageFill = getSliderPercentageFill({
  //   value: stopLossState.stopLossLevel,
  //   min: ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100)),
  //   max,
  // })

  const sliderConfig: SliderValuePickerProps = {
    ...autoTakeSliderBasicConfig,
    sliderPercentageFill,
    leftLabel: t('slider.set-auto-take-profit.left-label'),
    rightLabel: t('slider.set-auto-take-profit.right-label'),
    leftBoundry: min, // TODO level based on state like stopLossState.stopLossLevel,
    rightBoundry: max,
    lastValue: new BigNumber(300),//autoTakeProfitState.executionCollRatio, why undefined!?
    maxBoundry,
    minBoundry: min,
    onChange: (slCollRatio) => {
      if (autoTakeProfitState.collateralActive === undefined) {
        uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
          type: 'close-type',
          toCollateral: false,
        })
      }

      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'stop-loss-level',
        stopLossLevel: slCollRatio,
      })
    },
  }

  // TODO: TDAutoTakeProfit | replace with getAutomationPrimaryButtonLabel method when data is available
  const primaryButtonLabel = 'Temp CTA'

  if (isAutoTakeProfitActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {/* TODO: Should be displayed based on current form state */}
          <SidebarAutoTakeProfitEditingStage
            vault={vault}
            closePickerConfig={closePickerConfig}
            sliderConfig={sliderConfig}
          />
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
