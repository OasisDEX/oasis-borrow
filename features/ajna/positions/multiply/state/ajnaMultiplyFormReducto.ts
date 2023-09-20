import type BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import type { AjnaCloseTo, AjnaMultiplyAction, AjnaMultiplyPanel } from 'features/ajna/common/types'
import type {
  AjnaFormActionsReset,
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateDpm,
  AjnaFormActionsUpdateGenerate,
  AjnaFormActionsUpdatePayback,
  AjnaFormActionsUpdatePaybackMax,
  AjnaFormActionsUpdateWithdraw,
  AjnaUpdateLoanToValue,
} from 'features/ajna/positions/common/state/ajnaFormReductoActions'
import type { ReductoActions } from 'helpers/useReducto';
import { useReducto } from 'helpers/useReducto'

export interface AjnaMultiplyFormState {
  action?: AjnaMultiplyAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
  paybackAmountMax: boolean
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  loanToValue?: BigNumber
  closeTo: AjnaCloseTo
  uiDropdown: AjnaMultiplyPanel
  uiPill: Exclude<
    AjnaMultiplyAction,
    'adjust' | 'open-multiply' | 'switch-multiply' | 'close-multiply'
  >
}

export type AjnaMultiplyFormAction = ReductoActions<
  AjnaMultiplyFormState,
  | AjnaFormActionsUpdateDeposit
  | AjnaFormActionsUpdateGenerate
  | AjnaFormActionsUpdatePayback
  | AjnaFormActionsUpdatePaybackMax
  | AjnaFormActionsUpdateWithdraw
  | AjnaFormActionsUpdateDpm
  | AjnaFormActionsReset
  | AjnaUpdateLoanToValue
>

export const ajnaMultiplyReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
  generateAmountUSD: undefined,
  paybackAmount: undefined,
  paybackAmountUSD: undefined,
  paybackAmountMax: false,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  loanToValue: undefined,
}

export const ajnaMultiplyDefault: AjnaMultiplyFormState = {
  ...ajnaMultiplyReset,
  closeTo: 'collateral',
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'adjust',
  uiPill: 'deposit-collateral-multiply',
}

export function useAjnaMultiplyFormReducto({ ...rest }: Partial<AjnaMultiplyFormState>) {
  const { dispatch, state, updateState } = useReducto<
    AjnaMultiplyFormState,
    AjnaMultiplyFormAction
  >({
    defaults: {
      ...ajnaMultiplyDefault,
      ...rest,
    },
    reducer: (state: AjnaMultiplyFormState, action: AjnaMultiplyFormAction) => {
      switch (action.type) {
        case 'update-deposit':
          return {
            ...state,
            depositAmount: action.depositAmount,
            depositAmountUSD: action.depositAmountUSD,
            loanToValue: undefined,
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
        case 'update-payback-max':
          return {
            ...state,
            paybackAmountMax: action.paybackAmountMax,
          }
        case 'update-withdraw':
          return {
            ...state,
            withdrawAmount: action.withdrawAmount,
            withdrawAmountUSD: action.withdrawAmountUSD,
          }
        case 'update-dpm':
          return {
            ...state,
            dpmAddress: action.dpmAddress,
          }
        case 'reset':
          return {
            ...state,
            ...ajnaMultiplyReset,
          }
        case 'update-loan-to-value':
          return {
            ...state,
            loanToValue: action.loanToValue,
          }
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
