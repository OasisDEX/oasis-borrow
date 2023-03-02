import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { AjnaEarnAction, AjnaEarnPanel } from 'features/ajna/common/types'
import {
  AjnaFormActionsReset,
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateDpm,
  AjnaFormActionsUpdateWithdraw,
} from 'features/ajna/positions/common/state/ajnaFormReductoActions'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaEarnFormState {
  action?: AjnaEarnAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  price?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  uiDropdown: AjnaEarnPanel
  uiPill: Exclude<AjnaEarnAction, 'open-earn'>
}

export type AjnaEarnFormAction = ReductoActions<
  AjnaEarnFormState,
  | AjnaFormActionsUpdateDeposit
  | AjnaFormActionsUpdateWithdraw
  | AjnaFormActionsUpdateDpm
  | AjnaFormActionsReset
>

export const ajnaEarnReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
}

export const ajnaEarnDefault: AjnaEarnFormState = {
  ...ajnaEarnReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'adjust',
  uiPill: 'deposit-earn',
}

export function useAjnaEarnFormReducto({ ...rest }: Partial<AjnaEarnFormState>) {
  const { dispatch, state, updateState } = useReducto<AjnaEarnFormState, AjnaEarnFormAction>({
    defaults: {
      ...ajnaEarnDefault,
      ...rest,
    },
    reducer: (state: AjnaEarnFormState, action: AjnaEarnFormAction) => {
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
        case 'update-dpm':
          return {
            ...state,
            dpmAddress: action.dpmAddress,
          }
        case 'reset':
          return { ...state, ...ajnaEarnReset, price: rest.price }
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
