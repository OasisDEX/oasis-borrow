import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'

export type SidebarVaultStages = OpenVaultStage | ManageBorrowVaultStage
export type SidebarFlow = 'openBorrow' | 'manageBorrow' | 'openMultiply' | 'manageMultiply'
