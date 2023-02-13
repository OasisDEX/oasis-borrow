import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { AjnaBorrowAction, AjnaBorrowPanel } from 'features/ajna/common/types'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaBorrowFormState {
  action?: AjnaBorrowAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  uiDropdown: AjnaBorrowPanel
  uiPill: Exclude<AjnaBorrowAction, 'open'>
}

interface AjnaBorrowFormActionsUpdateDeposit {
  type: 'update-deposit'
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
}
interface AjnaBorrowFormActionsUpdateWithdraw {
  type: 'update-withdraw'
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
}
interface AjnaBorrowFormActionsUpdateGenerate {
  type: 'update-generate'
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
}
interface AjnaBorrowFormActionsUpdatePayback {
  type: 'update-payback'
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
}
interface AjnaBorrowFormActionsReset {
  type: 'reset'
}

type AjnaBorrowFormAction = ReductoActions<
  AjnaBorrowFormState,
  | AjnaBorrowFormActionsUpdateDeposit
  | AjnaBorrowFormActionsUpdateWithdraw
  | AjnaBorrowFormActionsUpdateGenerate
  | AjnaBorrowFormActionsUpdatePayback
  | AjnaBorrowFormActionsReset
>

export const ajnaBorrowReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
  generateAmountUSD: undefined,
  paybackAmount: undefined,
  paybackAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
}

export const ajnaBorrowDefault: AjnaBorrowFormState = {
  ...ajnaBorrowReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'collateral',
  uiPill: 'deposit',
}

export function useAjnaBorrowFormReducto({ ...rest }: Partial<AjnaBorrowFormState>) {
  const { dispatch, state, updateState } = useReducto<AjnaBorrowFormState, AjnaBorrowFormAction>({
    defaults: {
      action: 'open',
      ...ajnaBorrowDefault,
      ...rest,
    },
    reducer: (state: AjnaBorrowFormState, action: AjnaBorrowFormAction) => {
      switch (action.type) {
        case 'update-deposit':
          return {
            ...state,
            depositAmount: action.depositAmount,
            depositAmountUSD: action.depositAmountUSD,
          }
        case 'update-withdraw':
          return {
            ...state,
            withdrawAmount: action.withdrawAmount,
            withdrawAmountUSD: action.withdrawAmountUSD,
          }
        case 'update-generate':
          return {
            ...state,
            generateAmount: action.generateAmount,
            generateAmountUSD: action.generateAmountUSD,
          }
        case 'update-payback':
          return {
            ...state,
            paybackAmount: action.paybackAmount,
            paybackAmountUSD: action.paybackAmountUSD,
          }
        case 'reset':
          return { ...state, ...ajnaBorrowReset }
        default:
          return state
      }
    },
  })

  return {
    dispatch,
    state,
    updateState,
  }
}
