import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { AjnaEarnAction } from 'features/ajna/common/types'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaEarnFormState {
  action?: AjnaEarnAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  price?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
}

interface AjnaEarnFormActionsUpdateDeposit {
  type: 'update-deposit'
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
}
interface AjnaEarnFormActionsUpdateWithdraw {
  type: 'update-withdraw'
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
}
interface AjnaBorrowFormActionsUpdateDpm {
  type: 'update-dpm'
  dpmAddress: string
}
interface AjnaEarnFormActionsReset {
  type: 'reset'
}

export type AjnaEarnFormAction = ReductoActions<
  AjnaEarnFormState,
  | AjnaEarnFormActionsUpdateDeposit
  | AjnaEarnFormActionsUpdateWithdraw
  | AjnaBorrowFormActionsUpdateDpm
  | AjnaEarnFormActionsReset
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
