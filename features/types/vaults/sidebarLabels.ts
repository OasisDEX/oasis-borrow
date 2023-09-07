import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/manageMultiplyVault'

export type SidebarVaultStages = OpenVaultStage | ManageMultiplyVaultStage 
export type SidebarFlow = 'openBorrow' | 'manageBorrow' | 'openMultiply' | 'manageMultiply' | 'openGuni' | 'manageGuni' | 'addSl'
