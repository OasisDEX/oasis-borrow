import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { closeVaultOptions } from 'features/automation/common/consts'

import { AUTO_TAKE_PROFIT_FORM_CHANGE, AutoTakeProfitFormChange } from './autoTakeProfitFormChange'

interface GetAutoTakeProfitStatusParams {
  // TODO ŁW
  // autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  autoTakeProfitState: AutoTakeProfitFormChange
  vault: Vault
  // isRemoveForm: boolean
  // isProgressStage: boolean
  // isOwner: boolean
  // isAddForm: boolean
}

interface AutoTakeProfitStatus {
  executionPrice: BigNumber
  closePickerConfig: PickCloseStateProps
}

export function getAutoTakeProfitStatus({
  autoTakeProfitState,
  vault,
}: GetAutoTakeProfitStatusParams): AutoTakeProfitStatus {
  const { uiChanges } = useAppContext()

  const executionPrice = collateralPriceAtRatio({
    colRatio: autoTakeProfitState.executionCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const closePickerConfig = {
    optionNames: closeVaultOptions,
    onclickHandler: (optionName: string) => {
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'close-type',
        toCollateral: optionName === closeVaultOptions[0],
      })
    },
    isCollateralActive: autoTakeProfitState.collateralActive,
    collateralTokenSymbol: vault.token,
    collateralTokenIconCircle: getToken(vault.token).iconCircle,
  }
  return {
    executionPrice,
    closePickerConfig,
  }
}
