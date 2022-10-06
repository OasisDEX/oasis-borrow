import BigNumber from 'bignumber.js'
import { ratioAtCollateralPrice } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
// import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'
import { SidebarAutoTakeProfitEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitEditingStage'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
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
  constantMultipleTriggerData: ConstantMultipleTriggerData
  feature: AutomationFeatures
  isAutoTakeProfitActive: boolean
  max: BigNumber
  min: BigNumber
  vault: Vault
  closePickerConfig: PickCloseStateProps
  txHandler: () => void
  textButtonHandler: () => void
  stage: SidebarAutomationStages
  isFirstSetup: boolean
  isAddForm: boolean
  isRemoveForm: boolean
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
}
// TODO ŁW Slider config
export function SidebarSetupAutoTakeProfit({
  autoBuyTriggerData,
  autoTakeProfitState,
  constantMultipleTriggerData,
  feature,
  isAutoTakeProfitActive,
  max,
  min,
  vault,
  closePickerConfig,
  txHandler,
  stage,
  isFirstSetup,
  isAddForm,
  isRemoveForm,
  autoTakeProfitTriggerData,
}: // textButtonHandler,
SidebarSetupAutoTakeProfitProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Optimization',
    forcePanel: AutomationFeatures.AUTO_TAKE_PROFIT,
    disabled: isDropdownDisabled({ stage }),
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
    isAutoTakeProfitEnabled: autoTakeProfitTriggerData.isTriggerEnabled,
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({
    flow,
    stage,
    feature,
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

  if (isAutoTakeProfitActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && (
                <SidebarAutoTakeProfitEditingStage
                  closePickerConfig={closePickerConfig}
                  sliderConfig={sliderConfig}
                  vault={vault}
                />
              )}
            </>
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: false,
        isLoading: stage === 'txInProgress',
        action: () => txHandler(),
        // TODO ŁW
        // ...(stage !== 'txInProgress' && {
        //   textButton: {
        //     label: textButtonLabel,
        //     hidden: true, //isFirstSetup,
        //     action: () => textButtonHandler(),
        //   },
        // }),
        // status: sidebarStatus,
      },
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
