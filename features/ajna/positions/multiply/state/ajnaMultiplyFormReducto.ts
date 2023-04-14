import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { AjnaMultiplyAction, AjnaMultiplyPanel } from 'features/ajna/common/types'
import {
  AjnaFormActionsReset,
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateDpm,
  AjnaFormActionsUpdateTargetLiquidationPrice,
  AjnaFormActionsUpdateWithdraw,
} from 'features/ajna/positions/common/state/ajnaFormReductoActions'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaMultiplyFormState {
  action?: AjnaMultiplyAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  targetLiquidationPrice?: BigNumber
  uiDropdown: AjnaMultiplyPanel
  uiPill: Exclude<AjnaMultiplyAction, 'open-multiply' | 'switch-multiply' | 'close-multiply'>
}

export type AjnaMultiplyFormAction = ReductoActions<
  AjnaMultiplyFormState,
  | AjnaFormActionsUpdateDeposit
  | AjnaFormActionsUpdateWithdraw
  | AjnaFormActionsUpdateTargetLiquidationPrice
  | AjnaFormActionsUpdateDpm
  | AjnaFormActionsReset
>

export const ajnaMultiplyReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
}

export const ajnaMultiplyDefault: AjnaMultiplyFormState = {
  ...ajnaMultiplyReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'collateral',
  uiPill: 'deposit-multiply',
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
        case 'update-withdraw':
          return {
            ...state,
            withdrawAmount: action.withdrawAmount,
            withdrawAmountUSD: action.withdrawAmountUSD,
          }
        case 'update-target-liquidation-price':
          return {
            ...state,
            targetLiquidationPrice: action.targetLiquidationPrice,
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
