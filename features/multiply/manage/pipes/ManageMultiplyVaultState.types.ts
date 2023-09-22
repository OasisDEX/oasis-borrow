import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData.types'
import type { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'

import type { ManageVaultCalculations } from './manageMultiplyVaultCalculations.types'
import type { ManageVaultConditions } from './manageMultiplyVaultConditions.types'
import type { ManageVaultSummary } from './manageMultiplyVaultSummary.types'
import type { ManageVaultEnvironment } from './ManageVaultEnvironment.types'
import type { ManageVaultFunctions } from './ManageVaultFunctions.types'
import type { ManageVaultTxInfo } from './ManageVaultTxInfo.types'
import type { MutableManageMultiplyVaultState } from './MutableManageMultiplyVaultState.types'

export type ManageMultiplyVaultState = MutableManageMultiplyVaultState &
  ManageVaultCalculations &
  ManageVaultConditions &
  ManageVaultEnvironment &
  ManageVaultFunctions &
  ManageVaultTxInfo & {
    errorMessages: VaultErrorMessage[]
    warningMessages: VaultWarningMessage[]
    summary: ManageVaultSummary
    initialTotalSteps: number
    totalSteps: number
    currentStep: number
    stopLossData?: StopLossTriggerData
    autoBuyData?: AutoBSTriggerData
    autoSellData?: AutoBSTriggerData
    constantMultipleData?: ConstantMultipleTriggerData
    autoTakeProfitData?: AutoTakeProfitTriggerData
  } & HasGasEstimation
