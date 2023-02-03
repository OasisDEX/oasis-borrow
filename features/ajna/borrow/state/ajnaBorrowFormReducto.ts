import BigNumber from 'bignumber.js'
import { AjnaBorrowAction } from 'features/ajna/common/types'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaBorrowFormState {
  action?: AjnaBorrowAction
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  proxyAddress?: string
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
interface AjnaBorrowFormActionsUpdateProxyAddress {
  type: 'update-proxy-address'
  proxyAddress: string
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
  | AjnaBorrowFormActionsUpdateProxyAddress
  | AjnaBorrowFormActionsReset
>

export const ajnaBorrowDefault: AjnaBorrowFormState = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
  generateAmountUSD: undefined,
  paybackAmount: undefined,
  paybackAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  // TODO once DPM implemented should be undefined as default
  proxyAddress: '0xF5C0D205a00A5F799E3CFC4AC2E71C326Dd12b76',
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
        case 'update-proxy-address':
          return {
            ...state,
            proxyAddress: action.proxyAddress,
          }
        case 'reset':
          return ajnaBorrowDefault
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
