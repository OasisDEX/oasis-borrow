import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { useMainContext } from 'components/context'
import { getAutoBSVaultChange } from 'features/automation/common/helpers/getAutoBSVaultChange'
import type { SidebarAutomationStages } from 'features/automation/common/types'
import {
  checkIfIsDisabledConstantMultiple,
  checkIfIsEditingConstantMultiple,
} from 'features/automation/optimization/constantMultiple/helpers'
import { prepareConstantMultipleResetData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { OAZO_FEE } from 'helpers/multiply/calculations.constants'
import { useObservable } from 'helpers/observableHook'

import type { ConstantMultipleFormChange } from './constantMultipleFormChange.types'
import type { ConstantMultipleTriggerData } from './constantMultipleTriggerData.types'

interface GetConstantMultipleStatusParams {
  constantMultipleState: ConstantMultipleFormChange
  constantMultipleTriggerData: ConstantMultipleTriggerData
  ethMarketPrice: BigNumber
  isAddForm: boolean
  isOwner: boolean
  isProgressStage: boolean
  isRemoveForm: boolean
  stage: SidebarAutomationStages
  lockedCollateral: BigNumber
  debt: BigNumber
  positionRatio: BigNumber
}

interface ConstantMultipleStatus {
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  debtDeltaAfterBuy: BigNumber
  debtDeltaAfterSell: BigNumber
  debtDeltaWhenSellAtCurrentCollRatio: BigNumber
  estimatedBuyFee: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedSellFee: BigNumber
  isDisabled: boolean
  isEditing: boolean
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  resetData: any
  sellPriceAtCurrentCollRatio: BigNumber
}

export function getConstantMultipleStatus({
  constantMultipleState,
  constantMultipleTriggerData,
  ethMarketPrice,
  isAddForm,
  isOwner,
  isProgressStage,
  isRemoveForm,
  stage,
  debt,
  lockedCollateral,
  positionRatio,
}: GetConstantMultipleStatusParams): ConstantMultipleStatus {
  const { gasPrice$ } = useMainContext()
  const [gasPrice] = useObservable(gasPrice$)

  const isEditing = checkIfIsEditingConstantMultiple({
    triggerData: constantMultipleTriggerData,
    state: constantMultipleState,
    isRemoveForm,
  })
  const isDisabled = checkIfIsDisabledConstantMultiple({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    state: constantMultipleState,
    stage,
  })
  const nextBuyPrice = collateralPriceAtRatio({
    colRatio: constantMultipleState.buyExecutionCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const nextSellPrice = collateralPriceAtRatio({
    colRatio: constantMultipleState.sellExecutionCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const sellPriceAtCurrentCollRatio = collateralPriceAtRatio({
    colRatio: positionRatio,
    collateral: lockedCollateral,
    vaultDebt: debt,
  })

  const { collateralDelta: collateralToBePurchased, debtDelta: debtDeltaAfterBuy } =
    getAutoBSVaultChange({
      targetCollRatio: constantMultipleState.targetCollRatio,
      execCollRatio: constantMultipleState.buyExecutionCollRatio,
      deviation: constantMultipleState.deviation,
      executionPrice: nextBuyPrice,
      lockedCollateral,
      debt,
    })
  const { collateralDelta: collateralToBeSold, debtDelta: debtDeltaAfterSell } =
    getAutoBSVaultChange({
      targetCollRatio: constantMultipleState.targetCollRatio,
      execCollRatio: constantMultipleState.sellExecutionCollRatio,
      deviation: constantMultipleState.deviation,
      executionPrice: nextSellPrice,
      lockedCollateral,
      debt,
    })
  const { debtDelta: debtDeltaWhenSellAtCurrentCollRatio } = getAutoBSVaultChange({
    targetCollRatio: constantMultipleState.targetCollRatio,
    execCollRatio: positionRatio.times(100),
    deviation: constantMultipleState.deviation,
    executionPrice: sellPriceAtCurrentCollRatio,
    lockedCollateral,
    debt,
  })
  const adjustMultiplyGasEstimation = new BigNumber(1100000) // average based on historical data from blockchain
  const estimatedGasCostOnTrigger = gasPrice
    ? amountFromWei(
        adjustMultiplyGasEstimation
          .multipliedBy(gasPrice?.maxFeePerGas)
          .multipliedBy(ethMarketPrice),
      )
    : undefined
  const estimatedBuyFee = debtDeltaAfterBuy.abs().times(OAZO_FEE)
  const estimatedSellFee = debtDeltaAfterSell.abs().times(OAZO_FEE)
  const resetData = prepareConstantMultipleResetData({
    defaultMultiplier: constantMultipleState.defaultMultiplier,
    defaultCollRatio: constantMultipleState.defaultCollRatio,
    constantMultipleTriggerData,
  })

  return {
    collateralToBePurchased,
    collateralToBeSold,
    debtDeltaAfterBuy,
    debtDeltaAfterSell,
    debtDeltaWhenSellAtCurrentCollRatio,
    estimatedBuyFee,
    estimatedGasCostOnTrigger,
    estimatedSellFee,
    isDisabled,
    isEditing,
    nextBuyPrice,
    nextSellPrice,
    resetData,
    sellPriceAtCurrentCollRatio,
  }
}
