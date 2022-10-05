import BigNumber from 'bignumber.js'
import { AutomationFormType } from 'features/automation/common/state/automationFeatureChange'

export const AUTO_TAKE_PROFIT_FORM_CHANGE = 'AUTO_TAKE_PROFIT_FORM_CHANGE'
// TODO ŁW
// export type AutoTakeProfitResetData = Pick<
//   AutoTakeProfitFormChange,
//
// >

export type AutoTakeProfitFormChangeAction =
  | { type: 'execution-price'; executionPrice: BigNumber; executionCollRatio: BigNumber }
  | { type: 'current-form'; currentForm: AutomationFormType }
  | { type: 'close-type'; toCollateral: boolean }
  | {
      type: 'form-defaults'
      executionPrice: BigNumber
      executionCollRatio: BigNumber
      toCollateral: boolean
    }
// TODO ŁW
//   | { type: 'txDetails...'}
// | {type: 'reset'; resetData: AutoTakeProfitResetData}

export function autoTakeProfitFormChangeReducer(
  state: AutoTakeProfitFormChange,
  action: AutoTakeProfitFormChangeAction,
): AutoTakeProfitFormChange {
  switch (action.type) {
    case 'execution-price':
      return {
        ...state,
        executionPrice: action.executionPrice,
        executionCollRatio: action.executionCollRatio,
      }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'close-type':
      return { ...state, toCollateral: action.toCollateral }
    case 'form-defaults':
      return {
        ...state,
        executionPrice: action.executionPrice,
        executionCollRatio: action.executionCollRatio,
        toCollateral: action.toCollateral,
      }
    // TODO ŁW
    //     case 'reset':
    //       return { ...state, ...action.resetData }
    default:
      return state
  }
}

export interface AutoTakeProfitFormChange {
  executionPrice: BigNumber
  executionCollRatio: BigNumber
  currentForm: AutomationFormType
  toCollateral: boolean
  // resetData: AutoTakeProfitResetData
}
