import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import {
  checkIfDisabledAutoBS,
  checkIfEditingAutoBS,
  getAutoBSVaultChange,
  prepareAutoBSResetData,
} from 'features/automation/common/helpers'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { SidebarAutomationStages } from 'features/automation/common/types'

interface GetAutoSellStatusParams {
  autoSellTriggerData: AutoBSTriggerData
  autoSellState: AutoBSFormChange
  isRemoveForm: boolean
  isProgressStage: boolean
  isOwner: boolean
  isAddForm: boolean
  stage: SidebarAutomationStages
  vault: Vault
}

interface AutoSellStatus {
  collateralDelta: BigNumber
  debtDelta: BigNumber
  debtDeltaAtCurrentCollRatio: BigNumber
  executionPrice: BigNumber
  executionPriceAtCurrentCollRatio: BigNumber
  isDisabled: boolean
  isEditing: boolean
  resetData: any
}

export function getAutoSellStatus({
  autoSellState,
  autoSellTriggerData,
  isAddForm,
  isOwner,
  isProgressStage,
  isRemoveForm,
  stage,
  vault,
}: GetAutoSellStatusParams): AutoSellStatus {
  const isEditing = checkIfEditingAutoBS({
    autoBSTriggerData: autoSellTriggerData,
    autoBSState: autoSellState,
    isRemoveForm,
  })
  const isDisabled = checkIfDisabledAutoBS({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    autoBSState: autoSellState,
    stage,
  })
  const executionPrice = collateralPriceAtRatio({
    colRatio: autoSellState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const executionPriceAtCurrentCollRatio = collateralPriceAtRatio({
    colRatio: vault.collateralizationRatio,
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const { debtDelta, collateralDelta } = getAutoBSVaultChange({
    targetCollRatio: autoSellState.targetCollRatio,
    execCollRatio: autoSellState.execCollRatio,
    deviation: autoSellState.deviation,
    executionPrice,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })
  const { debtDelta: debtDeltaAtCurrentCollRatio } = getAutoBSVaultChange({
    targetCollRatio: autoSellState.targetCollRatio,
    execCollRatio: vault.collateralizationRatio.times(100),
    deviation: autoSellState.deviation,
    executionPrice: executionPriceAtCurrentCollRatio,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })
  const resetData = prepareAutoBSResetData(
    autoSellTriggerData,
    vault.collateralizationRatio,
    AUTO_SELL_FORM_CHANGE,
  )

  return {
    collateralDelta,
    debtDelta,
    debtDeltaAtCurrentCollRatio,
    executionPrice,
    executionPriceAtCurrentCollRatio,
    isDisabled,
    isEditing,
    resetData,
  }
}
