import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { AjnaCloseTo, AjnaMultiplyAction, AjnaMultiplyPanel } from 'features/ajna/common/types'
import {
  AjnaFormActionsReset,
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateDpm,
  AjnaFormActionsUpdateGenerate,
  AjnaFormActionsUpdatePayback,
  AjnaFormActionsUpdateWithdraw,
} from 'features/ajna/positions/common/state/ajnaFormReductoActions'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaMultiplyFormState {
  action?: AjnaMultiplyAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  targetLiquidationPrice?: BigNumber
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
  | AjnaFormActionsUpdateWithdraw
  | AjnaFormActionsUpdateDpm
  | AjnaFormActionsReset
>

export const ajnaMultiplyReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
  generateAmountUSD: undefined,
  paybackAmount: undefined,
  paybackAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
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
            targetLiquidationPrice: rest.targetLiquidationPrice,
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
