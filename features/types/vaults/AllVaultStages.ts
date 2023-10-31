import type { Stage as GuniStage } from 'features/earn/guni/open/pipes/openGuniVault.types'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/ManageMultiplyVaultStage.types'

export type AllVaultStages = ManageMultiplyVaultStage | GuniStage
