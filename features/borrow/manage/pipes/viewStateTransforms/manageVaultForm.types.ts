import type { MainAction } from 'features/borrow/manage/pipes/types/MainAction.types'

export type ManageVaultFormChange =
  | {
      kind: 'toggleDepositAndGenerateOption'
    }
  | {
      kind: 'togglePaybackAndWithdrawOption'
    }
  | {
      kind: 'resetDefaults'
    }
  | {
      kind: 'mainAction'
      mainAction: MainAction
    }
