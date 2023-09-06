import { OpenAaveDepositBorrowParameters } from 'actions/aave-like/types/open-aave-deposit-borrow-parameters'
import { OpenMultiplyAaveParameters } from 'actions/aave-like/types/open-multiply-aave-parameters'

export type OpenAaveParameters = OpenMultiplyAaveParameters | OpenAaveDepositBorrowParameters
