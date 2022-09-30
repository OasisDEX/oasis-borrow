import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { closeVaultOptions } from 'features/automation/common/consts'
import { createTokenAth } from 'features/tokenAth/tokenAth'

import { AUTO_TAKE_PROFIT_FORM_CHANGE, AutoTakeProfitFormChange } from './autoTakeProfitFormChange'

interface GetAutoTakeProfitStatusParams {
  // TODO ŁW
  // autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  autoTakeProfitState: AutoTakeProfitFormChange
  tokenMarketPrice: BigNumber
  vault: Vault
  // isRemoveForm: boolean
  // isProgressStage: boolean
  // isOwner: boolean
  // isAddForm: boolean
}

interface AutoTakeProfitStatus {
  closePickerConfig: PickCloseStateProps
  executionPrice: BigNumber
  min: BigNumber
  max: BigNumber
}

const MIN_MULTIPLIER = 1.05
const MAX_MULTIPLIER_WITH_ATH = 2
const MAX_MULTIPLIER_WITH_PRICE = 10

export function getAutoTakeProfitStatus({
  autoTakeProfitState,
  tokenMarketPrice,
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
  const tokenAth = createTokenAth(vault.token)
  const min = tokenMarketPrice.times(MIN_MULTIPLIER)
  const max = tokenAth
    ? tokenAth.times(MAX_MULTIPLIER_WITH_ATH)
    : tokenMarketPrice.times(MAX_MULTIPLIER_WITH_PRICE)

  console.log(`tokenAth: ${tokenAth}`)
  console.log(`${min}, ${max}`)

  return {
    executionPrice,
    closePickerConfig,
    min,
    max,
  }
}
