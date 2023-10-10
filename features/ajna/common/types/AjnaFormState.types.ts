import type { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto.types'
import type { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto.types'
import type { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto.types'

export type AjnaFormState = AjnaBorrowFormState | AjnaEarnFormState | AjnaMultiplyFormState
