import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/types'

export type SidebarVaultStages = OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage 
export type SidebarFlow = 'openBorrow' | 'manageBorrow' | 'openMultiply' | 'manageMultiply' | 'openGuni' | 'manageGuni' | 'addSl'
