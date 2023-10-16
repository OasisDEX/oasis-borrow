import type { BorrowFormState } from 'features/ajna/positions/borrow/state/borrowFormReducto.types'
import type { EarnFormState } from 'features/ajna/positions/earn/state/earnFormReducto.types'
import type { MultiplyFormState } from 'features/ajna/positions/multiply/state/multiplyFormReducto.types'

export type AjnaFormState = BorrowFormState | EarnFormState | MultiplyFormState
