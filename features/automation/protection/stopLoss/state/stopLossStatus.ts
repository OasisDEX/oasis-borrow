import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { closeVaultOptions } from 'features/automation/common/consts'
import { getIsEditingStopLoss } from 'features/automation/protection/stopLoss/helpers'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'

interface GetStopLossStatusParams {
  stopLossTriggerData: StopLossTriggerData
  stopLossState: StopLossFormChange
  isRemoveForm: boolean
  vault: Vault
}

interface StopLossStatus {
  isEditing: boolean
  closePickerConfig: PickCloseStateProps
}

export function getStopLossStatus({
  stopLossTriggerData,
  stopLossState,
  isRemoveForm,
  vault,
}: GetStopLossStatusParams): StopLossStatus {
  const { uiChanges } = useAppContext()

  const isEditing = getIsEditingStopLoss({
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    selectedSLValue: stopLossState.stopLossLevel,
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    collateralActive: stopLossState.collateralActive,
    isToCollateral: stopLossTriggerData.isToCollateral,
    isRemoveForm,
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
    collateralTokenIconCircle: getToken(vault.token).iconCircle,
  }

  return {
    isEditing,
    closePickerConfig,
  }
}
