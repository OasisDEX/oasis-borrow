import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import {
  checkIfIsDisabledAutoBS,
  checkIfIsEditingAutoBS,
  getAutoBSVaultChange,
  prepareAutoBSResetData,
} from 'features/automation/common/helpers'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationBSPublishType, SidebarAutomationStages } from 'features/automation/common/types'

interface GetAutoBSStatusParams {
  autoBSState: AutoBSFormChange
  autoBSTriggerData: AutoBSTriggerData
  isRemoveForm: boolean
  isProgressStage: boolean
  isOwner: boolean
  isAddForm: boolean
  publishType: AutomationBSPublishType
  stage: SidebarAutomationStages
  lockedCollateral: BigNumber
  debt: BigNumber
  collateralizationRatio: BigNumber
}

interface AutoBSStatus {
  collateralDelta: BigNumber
  debtDelta: BigNumber
  debtDeltaAtCurrentCollRatio: BigNumber
  executionPrice: BigNumber
  executionPriceAtCurrentCollRatio: BigNumber
  isDisabled: boolean
  isEditing: boolean
  resetData: any
}

export function getAutoBSStatus({
  autoBSState,
  autoBSTriggerData,
  isAddForm,
  isOwner,
  isProgressStage,
  isRemoveForm,
  publishType,
  stage,
  debt,
  lockedCollateral,
  collateralizationRatio,
}: GetAutoBSStatusParams): AutoBSStatus {
  const isEditing = checkIfIsEditingAutoBS({
    autoBSTriggerData,
    autoBSState,
    isRemoveForm,
  })
  const isDisabled = checkIfIsDisabledAutoBS({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    autoBSState,
    stage,
  })
  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBSState.execCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const executionPriceAtCurrentCollRatio = collateralPriceAtRatio({
    colRatio: collateralizationRatio,
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const { debtDelta, collateralDelta } = getAutoBSVaultChange({
    targetCollRatio: autoBSState.targetCollRatio,
    execCollRatio: autoBSState.execCollRatio,
    deviation: autoBSState.deviation,
    executionPrice,
    lockedCollateral: lockedCollateral,
    debt: debt,
  })
  const { debtDelta: debtDeltaAtCurrentCollRatio } = getAutoBSVaultChange({
    targetCollRatio: autoBSState.targetCollRatio,
    execCollRatio: collateralizationRatio.times(100),
    deviation: autoBSState.deviation,
    executionPrice: executionPriceAtCurrentCollRatio,
    lockedCollateral: lockedCollateral,
    debt: debt,
  })
  const resetData = prepareAutoBSResetData(autoBSTriggerData, collateralizationRatio, publishType)

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
