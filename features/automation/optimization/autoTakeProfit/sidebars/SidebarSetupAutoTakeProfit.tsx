import BigNumber from 'bignumber.js'
import { ratioAtCollateralPrice } from 'blockchain/vault.maths'
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
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from '../state/autoTakeProfitFormChange'

interface SidebarSetupAutoTakeProfitProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoTakeProfitState: AutoTakeProfitFormChange
  closePickerConfig: PickCloseStateProps
  constantMultipleTriggerData: ConstantMultipleTriggerData
  feature: AutomationFeatures
  isAutoTakeProfitActive: boolean
  max: BigNumber
  min: BigNumber
  vault: Vault
}
// TODO ŁW Slider config
export function SidebarSetupAutoTakeProfit({
  autoBuyTriggerData,
  autoTakeProfitState,
  closePickerConfig,
  constantMultipleTriggerData,
  feature,
  isAutoTakeProfitActive,
  max,
  min,
  vault,
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
      x.isZero() ? '-' : `$${formatAmount(x, 'USD')} ${vault.token}`,
    rightBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x)),
    step: 1,
  }
  const sliderPercentageFill = getSliderPercentageFill({
    value: autoTakeProfitState.executionPrice,
    min: min,
    max,
  })
  const targetColRatio = ratioAtCollateralPrice({
    lockedCollateral: vault.lockedCollateral,
    collateralPriceUSD: autoTakeProfitState.executionPrice,
    vaultDebt: vault.debt,
  })
  const sliderConfig: SliderValuePickerProps = {
    ...autoTakeSliderBasicConfig,
    sliderPercentageFill,
    leftLabel: t('slider.set-auto-take-profit.left-label', { token: vault.token }),
    rightLabel: t('slider.set-auto-take-profit.right-label'),
    leftBoundry: autoTakeProfitState.executionPrice,
    rightBoundry: autoTakeProfitState.executionCollRatio,
    lastValue: autoTakeProfitState.executionPrice,
    maxBoundry: max,
    minBoundry: min,
    onChange: (value) => {
      if (autoTakeProfitState.toCollateral === undefined) {
        uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
          type: 'close-type',
          toCollateral: false,
        })
      }
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'execution-price',
        executionPrice: value.decimalPlaces(0, BigNumber.ROUND_DOWN),
        executionCollRatio: targetColRatio,
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
