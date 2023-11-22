import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'

export type OmniFormState = OmniBorrowFormState | OmniEarnFormState | OmniMultiplyFormState
