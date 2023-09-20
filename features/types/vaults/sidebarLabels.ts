import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault.types'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault.types'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/types'

export type SidebarVaultStages = OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage 
export type SidebarFlow = 'openBorrow' | 'manageBorrow' | 'openMultiply' | 'manageMultiply' | 'openGuni' | 'manageGuni' | 'addSl'
