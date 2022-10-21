import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import {
  closeVaultOptions,
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import { SidebarAutomationStages } from 'features/automation/common/types'
import {
  checkIfIsDisabledStopLoss,
  checkIfIsEditingStopLoss,
  getStartingSlRatio,
} from 'features/automation/protection/stopLoss/helpers'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'

interface GetStopLossStatusParams {
  stopLossTriggerData: StopLossTriggerData
  stopLossState: StopLossFormChange
  isRemoveForm: boolean
  isProgressStage: boolean
  isOwner: boolean
  isAddForm: boolean
  maxDebtForSettingStopLoss: boolean
  vault: Vault
  stage: SidebarAutomationStages
  ilkData: IlkData
}

interface StopLossStatus {
  isEditing: boolean
  isDisabled: boolean
  closePickerConfig: PickCloseStateProps
  resetData: StopLossResetData
  executionPrice: BigNumber
}

export function getStopLossStatus({
  stopLossTriggerData,
  stopLossState,
  isRemoveForm,
  isProgressStage,
  isOwner,
  isAddForm,
  maxDebtForSettingStopLoss,
  vault,
  stage,
  ilkData,
}: GetStopLossStatusParams): StopLossStatus {
  const { uiChanges } = useAppContext()

  const isEditing = checkIfIsEditingStopLoss({
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    selectedSLValue: stopLossState.stopLossLevel,
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    collateralActive: stopLossState.collateralActive,
    isToCollateral: stopLossTriggerData.isToCollateral,
    isRemoveForm,
  })
  const isDisabled = checkIfIsDisabledStopLoss({
    isAddForm,
    isEditing,
    isOwner,
    isProgressStage,
    maxDebtForSettingStopLoss,
    stage,
  })

  const sliderMin = ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100))
  const selectedStopLossCollRatioIfTriggerDoesntExist = sliderMin.plus(
    DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  )
  const initialSlRatioWhenTriggerDoesntExist = getStartingSlRatio({
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    initialStopLossSelected: selectedStopLossCollRatioIfTriggerDoesntExist,
  })
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
  const resetData: StopLossResetData = {
    stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    collateralActive: stopLossTriggerData.isToCollateral,
    txDetails: {},
  }

  const executionPrice = collateralPriceAtRatio({
    colRatio: stopLossState.stopLossLevel.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const closePickerConfig = {
    optionNames: closeVaultOptions,
    onclickHandler: (optionName: string) => {
      uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
        type: 'close-type',
        toCollateral: optionName === closeVaultOptions[0],
      })
    },
    isCollateralActive: stopLossState.collateralActive,
    collateralTokenSymbol: vault.token,
    collateralTokenIconCircle: getToken(vault.token).iconCircle, // Isn't this icon redundant? ~Ł
  }

  return {
    isEditing,
    isDisabled,
    resetData,
    closePickerConfig,
    executionPrice,
  }
}
