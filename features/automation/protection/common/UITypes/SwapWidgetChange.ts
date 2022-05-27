export const SWAP_WIDGET_CHANGE_SUBJECT = 'swapWidgetChange'

export type SwapWidgetChangeAction = { type: 'open'; token?: string } | { type: 'close' }

export interface SwapWidgetState {
  token?: string
  isOpen: boolean
}

export function swapWidgetChangeReducer(
  state: SwapWidgetState,
  action: SwapWidgetChangeAction,
): SwapWidgetState {
  switch (action.type) {
    case 'open':
      return { ...state, token: action.token, isOpen: true }
    case 'close':
      return { ...state, isOpen: false, token: undefined }
    default:
      return state
  }
}
