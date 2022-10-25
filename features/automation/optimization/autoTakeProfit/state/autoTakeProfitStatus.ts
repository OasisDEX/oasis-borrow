import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
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
import { one } from 'helpers/zero'

import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
  AutoTakeProfitResetData,
} from './autoTakeProfitFormChange'

interface GetAutoTakeProfitStatusParams {
  autoTakeProfitState: AutoTakeProfitFormChange
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  isOwner: boolean
  isProgressStage: boolean
  isRemoveForm: boolean
  stage: SidebarAutomationStages
  tokenMarketPrice: BigNumber
  vault: Vault
}

interface AutoTakeProfitStatus {
  closePickerConfig: PickCloseStateProps
  isDisabled: boolean
  isEditing: boolean
  max: BigNumber
  min: BigNumber
  resetData: AutoTakeProfitResetData
}

// const MIN_MULTIPLIER = 1.05
const MAX_MULTIPLIER_WITH_ATH = 2
const MAX_MULTIPLIER_WITH_PRICE = 10

export function getAutoTakeProfitStatus({
  autoTakeProfitState,
  autoTakeProfitTriggerData,
  isOwner,
  isProgressStage,
  isRemoveForm,
  stage,
  tokenMarketPrice,
  vault,
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
    optionNames: closeVaultOptions,
    onclickHandler: (optionName: string) => {
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
          vaultId: vault.id.toString(),
          ilk: vault.ilk,
          closeTo: optionName as CloseVaultTo,
        },
      )
    },
    isCollateralActive: autoTakeProfitState.toCollateral,
    collateralTokenSymbol: vault.token,
    collateralTokenIconCircle: getToken(vault.token).iconCircle,
  }
  const tokenAth = createTokenAth(vault.token)
  // TODO: bring back proper min slider value after testing
  // const min = tokenMarketPrice.times(MIN_MULTIPLIER)
  const min = one
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
