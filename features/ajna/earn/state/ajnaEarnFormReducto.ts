import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import {
  AjnaEarnAction,
  AjnaEarnPanel,
  AjnaFormActionsReset,
  AjnaFormActionsUpdateDeposit,
} from 'features/ajna/common/types'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaEarnFormState {
  action?: AjnaEarnAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  priceBucketUSD?: BigNumber
  uiDropdown: AjnaEarnPanel
  uiPill: Exclude<AjnaEarnAction, 'open'>
}

interface AjnaEarnFormActionsUpdateWithdraw {
  type: 'update-withdraw'
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
}
interface AjnaEarnFormActionsUpdatePriceBucket {
  type: 'update-price-bucket'
  priceBucketUSD?: BigNumber
}

export type AjnaEarnFormAction = ReductoActions<
  AjnaEarnFormState,
  | AjnaFormActionsUpdateDeposit
  | AjnaEarnFormActionsUpdateWithdraw
  | AjnaEarnFormActionsUpdatePriceBucket
  | AjnaFormActionsReset
>

export const ajnaEarnReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  priceBucketUSD: undefined,
}

export const ajnaBorrowDefault: AjnaEarnFormState = {
  ...ajnaEarnReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'deposit',
  uiPill: 'deposit',
}

export function useAjnaEarnFormReducto({ ...rest }: Partial<AjnaEarnFormState>) {
  const { dispatch, state, updateState } = useReducto<AjnaEarnFormState, AjnaEarnFormAction>({
    defaults: {
      ...ajnaBorrowDefault,
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
        case 'update-price-bucket':
          return {
            ...state,
            priceBucketUSD: action.priceBucketUSD,
          }
        case 'reset':
          return { ...state, ...ajnaEarnReset }
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
