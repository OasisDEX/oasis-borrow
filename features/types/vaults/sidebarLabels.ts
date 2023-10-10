import { OpenVaultStage } from 'features/borrow/open/pipes/openVault.types'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/ManageMultiplyVaultStage.types'

export type SidebarVaultStages = OpenVaultStage | ManageMultiplyVaultStage 
export type SidebarFlow = 'openBorrow' | 'manageBorrow' | 'openMultiply' | 'manageMultiply' | 'openGuni' | 'manageGuni' | 'addSl'
