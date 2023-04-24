import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { closeVaultOptions } from 'features/automation/common/consts'
import { SidebarAutomationStages } from 'features/automation/common/types'
import {
  checkIfIsDisabledAutoTakeProfit,
  checkIfIsEditingAutoTakeProfit,
} from 'features/automation/optimization/autoTakeProfit/helpers'
import {
  AutoTakeProfitTriggerData,
  prepareAutoTakeProfitResetData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createTokenAth } from 'features/tokenAth/tokenAth'

import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
  AutoTakeProfitResetData,
} from './autoTakeProfitFormChange'

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
  const { uiChanges } = useAppContext()

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
        AutomationEventIds.CloseToX,
        Pages.TakeProfit,
        CommonAnalyticsSections.Form,
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
