import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
// import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarAutoTakeProfitEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitEditingStage'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useHash } from 'helpers/useHash'
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
  txHandler: ({ callOnSuccess }: { callOnSuccess?: () => void }) => void
  textButtonHandler: () => void
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
  txHandler,
  // textButtonHandler,
}: SidebarSetupAutoTakeProfitProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const [, setHash] = useHash()

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
    leftBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : '$ ' + formatAmount(x, 'USD')),
    rightBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x)),
    step: 1,
  }

  const min = vault.collateralizationRatio.multipliedBy(100)
  const max = new BigNumber(500) // TODO ŁW coll ratio if price reached last ATH+100%
  const maxBoundry = max
  const priceValueForCollRatio = collateralPriceAtRatio({
    colRatio: autoTakeProfitState.executionCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const sliderPercentageFill = getSliderPercentageFill({
    value: autoTakeProfitState.executionCollRatio.times(100),
    min: min,
    max,
  })

  const sliderConfig: SliderValuePickerProps = {
    ...autoTakeSliderBasicConfig,
    sliderPercentageFill,
    leftLabel: t('slider.set-auto-take-profit.left-label'),
    rightLabel: t('slider.set-auto-take-profit.right-label'),
    leftBoundry: priceValueForCollRatio, // TODO price for coll ratio collateralPriceAtRatio also calculated in status
    rightBoundry: autoTakeProfitState.executionCollRatio,
    lastValue: autoTakeProfitState.executionCollRatio.decimalPlaces(0, BigNumber.ROUND_DOWN), //autoTakeProfitState.executionCollRatio, why undefined!?
    maxBoundry,
    minBoundry: min,
    onChange: (executionCollRatio) => {
      if (autoTakeProfitState.collateralActive === undefined) {
        uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
          type: 'close-type',
          toCollateral: false,
        })
      }

      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        executionCollRatio: executionCollRatio,
      })
    },
  }

  // TODO: TDAutoTakeProfit | replace with getAutomationPrimaryButtonLabel method when data is available
  const primaryButtonLabel = 'Temp CTA'
  // TODO ŁW txt button
  // const textButtonLabel = getAutomationTextButtonLabel({ isAddForm: true }) // TODO Łw change when middlesteps

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
        disabled: false,
        isLoading: false, //stage === 'txInProgress',
        action: () =>
          txHandler({
            callOnSuccess: () => {
              uiChanges.publish(TAB_CHANGE_SUBJECT, {
                type: 'change-tab',
                currentMode: VaultViewMode.Overview,
              })
              setHash(VaultViewMode.Overview)
            },
          }),
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
