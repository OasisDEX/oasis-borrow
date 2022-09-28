import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { closeVaultOptions } from 'features/automation/common/consts'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupAutoTakeProfit } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarSetupAutoTakeProfit'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from '../state/autoTakeProfitFormChange'

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
  const { uiChanges } = useAppContext()
  const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(AUTO_TAKE_PROFIT_FORM_CHANGE)

  const feature = AutomationFeatures.AUTO_TAKE_PROFIT

  const closePickerConfig = {
    optionNames: closeVaultOptions,
    onclickHandler: (optionName: string) => {
      alert(optionName)
      // TODO ŁW implement atp form change
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'close-type',
        toCollateral: optionName === closeVaultOptions[0],
      })
    },
    isCollateralActive: true,
    collateralTokenSymbol: vault.token,
    collateralTokenIconCircle: getToken(vault.token).iconCircle,
  }

  return (
    // TODO: TDAutoTakeProfit | should be used with AddAndRemoveTriggerControl as a wrapper when there is enough data
    <SidebarSetupAutoTakeProfit
      autoBuyTriggerData={autoBuyTriggerData}
      constantMultipleTriggerData={constantMultipleTriggerData}
      feature={feature}
      isAutoTakeProfitActive={isAutoTakeProfitActive}
      vault={vault}
      closePickerConfig={closePickerConfig}
      autoTakeProfitState={autoTakeProfitState}
    />
  )
}
