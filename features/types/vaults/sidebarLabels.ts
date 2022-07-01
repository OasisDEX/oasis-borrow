import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/manageMultiplyVault'

export type SidebarVaultStages = OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage
export type SidebarFlow = 'openBorrow' | 'manageBorrow' | 'openMultiply' | 'manageMultiply' | 'openGuni' | 'manageGuni' | 'addSl' | 'adjustSl' | 'cancelSl' | 'addBasicSell' | 'cancelBasicSell' | 'editBasicSell' | 'addBasicBuy' | 'cancelBasicBuy' | 'editBasicBuy'
