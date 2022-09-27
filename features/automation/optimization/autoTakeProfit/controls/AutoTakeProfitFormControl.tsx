import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { closeVaultOptions } from 'features/automation/common/consts'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupAutoTakeProfit } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarSetupAutoTakeProfit'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AutoTakeProfitFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoTakeProfitActive: boolean
  vault: Vault
}

export function AutoTakeProfitFormControl({
  autoBuyTriggerData,
  constantMultipleTriggerData,
  isAutoTakeProfitActive,
  vault,
}: AutoTakeProfitFormControlProps) {
  const feature = AutomationFeatures.AUTO_TAKE_PROFIT
  // const { uiChanges } = useAppContext()

  const closePickerConfig = {
    optionNames: closeVaultOptions,
    onclickHandler: (optionName: string) => {
      alert(optionName)
      // TODO ŁW implement atp form change
      // uiChanges.publish(TAKE_PROFIT_FORM_CHANGE, {
      //   type: 'close-type',
      //   toCollateral: optionName === closeVaultOptions[0],
      // })
    },
    isCollateralActive: true,
    collateralTokenSymbol: vault.token,
    collateralTokenIconCircle: getToken(vault.token).iconCircle,
  }
  const autoTakeSliderBasicConfig = {
    disabled: false,
    leftBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : '$ ' + formatAmount(x, vault.token)),
    rightBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x)),
    step: 1,
  }

  const sliderPercentageFill = new BigNumber (1025.00)
  // TODO ŁW slider % fill based on selected price
  // const sliderPercentageFill = getSliderPercentageFill({
  //   value: stopLossState.stopLossLevel,
  //   min: ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100)),
  //   max,
  // })
  const { t } = useTranslation()


  // const sliderConfig: SliderValuePickerProps = {
  //   ...autoTakeSliderBasicConfig,
  //   sliderPercentageFill,
  //   leftLabel: t('slider.set-auto-take-profit.left-label'),
  //   rightLabel: t('slider.set-auto-take-profit.right-label'),
  //   leftBoundry: new BigNumber(9000)// TODO level based on state like stopLossState.stopLossLevel,
  //   rightBoundry: afterNewLiquidationPrice,
  //   lastValue: stopLossState.stopLossLevel,
  //   maxBoundry,
  //   minBoundry: liqRatio.multipliedBy(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
  //   onChange: (slCollRatio) => {
  //     if (stopLossState.collateralActive === undefined) {
  //       uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
  //         type: 'close-type',
  //         toCollateral: false,
  //       })
  //     }

  //     uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
  //       type: 'stop-loss-level',
  //       stopLossLevel: slCollRatio,
  //     })
  //   },
  // }
  return (
    // TODO: TDAutoTakeProfit | should be used with AddAndRemoveTriggerControl as a wrapper when there is enough data
    <SidebarSetupAutoTakeProfit
      autoBuyTriggerData={autoBuyTriggerData}
      constantMultipleTriggerData={constantMultipleTriggerData}
      feature={feature}
      isAutoTakeProfitActive={isAutoTakeProfitActive}
      vault={vault}
      closePickerConfig={closePickerConfig}
      // sliderConfig={sliderConfig}
    />
  )
}
