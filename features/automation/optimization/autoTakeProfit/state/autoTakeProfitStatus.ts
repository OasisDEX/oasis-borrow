import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import type BigNumber from 'bignumber.js'
import type { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { closeVaultOptions } from 'features/automation/common/consts'
import type { SidebarAutomationStages } from 'features/automation/common/types'
import {
  checkIfIsDisabledAutoTakeProfit,
  checkIfIsEditingAutoTakeProfit,
} from 'features/automation/optimization/autoTakeProfit/helpers'
import { prepareAutoTakeProfitResetData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'
import { createTokenAth } from 'features/tokenAth/tokenAth'
import { uiChanges } from 'helpers/uiChanges'

import { AUTO_TAKE_PROFIT_FORM_CHANGE } from './autoTakeProfitFormChange.constants'
import type {
  AutoTakeProfitFormChange,
  AutoTakeProfitResetData,
} from './autoTakeProfitFormChange.types'
import type { AutoTakeProfitTriggerData } from './autoTakeProfitTriggerData.types'

interface GetAutoTakeProfitStatusParams {
  id: BigNumber
  token: string
  ilk: string
  autoTakeProfitState: AutoTakeProfitFormChange
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  isOwner: boolean
  isProgressStage: boolean
  isRemoveForm: boolean
  stage: SidebarAutomationStages
  tokenMarketPrice: BigNumber
}

interface AutoTakeProfitStatus {
  closePickerConfig: PickCloseStateProps
  isDisabled: boolean
  isEditing: boolean
  max: BigNumber
  min: BigNumber
  resetData: AutoTakeProfitResetData
}

const MIN_MULTIPLIER = 1.05
const MAX_MULTIPLIER_WITH_ATH = 2
const MAX_MULTIPLIER_WITH_PRICE = 10

export function getAutoTakeProfitStatus({
  id,
  token,
  ilk,
  autoTakeProfitState,
  autoTakeProfitTriggerData,
  isOwner,
  isProgressStage,
  isRemoveForm,
  stage,
  tokenMarketPrice,
}: GetAutoTakeProfitStatusParams): AutoTakeProfitStatus {
  const isEditing = checkIfIsEditingAutoTakeProfit({
    autoTakeProfitState,
    autoTakeProfitTriggerData,
    isRemoveForm,
  })
  const isDisabled = checkIfIsDisabledAutoTakeProfit({
    isEditing,
    isOwner,
    isProgressStage,
    stage,
  })
  const closePickerConfig = {
    collateralTokenSymbol: token,
    isCollateralActive: autoTakeProfitState.toCollateral,
    onClickHandler: (optionName: string) => {
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'close-type',
        toCollateral: optionName === closeVaultOptions[0],
      })
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'is-editing',
        isEditing: true,
      })

      trackingEvents.automation.buttonClick(
        MixpanelAutomationEventIds.CloseToX,
        MixpanelPages.TakeProfit,
        MixpanelCommonAnalyticsSections.Form,
        {
          vaultId: id.toString(),
          ilk: ilk,
          closeTo: optionName as CloseVaultTo,
        },
      )
    },
  }
  const tokenAth = createTokenAth(token)
  const min = tokenMarketPrice.times(MIN_MULTIPLIER)
  const max = tokenAth
    ? tokenAth.times(MAX_MULTIPLIER_WITH_ATH)
    : tokenMarketPrice.times(MAX_MULTIPLIER_WITH_PRICE)

  const resetData = prepareAutoTakeProfitResetData(autoTakeProfitState, autoTakeProfitTriggerData)

  return {
    closePickerConfig,
    isDisabled,
    isEditing,
    max,
    min,
    resetData,
  }
}
