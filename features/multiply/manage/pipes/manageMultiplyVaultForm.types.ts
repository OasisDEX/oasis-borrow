import type { OtherAction } from './OtherAction.types'
import type { CloseVaultTo } from './CloseVaultTo.types'
import type { MainAction } from './MainAction.types'

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
      kind: 'toggleSliderController'
    }
  | {
      kind: 'mainAction'
      mainAction: MainAction
    }
  | {
      kind: 'otherAction'
      otherAction: OtherAction
    }
  | {
      kind: 'closeVaultTo'
      closeVaultTo: CloseVaultTo
    }
