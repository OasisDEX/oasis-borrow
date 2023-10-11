import type { WidgetConfig } from '@lifi/widget'

export const SWAP_WIDGET_CHANGE_SUBJECT = 'swapWidgetChange'

export type SwapWidgetChangeAction =
  | { type: 'open'; token?: string; variant?: WidgetConfig['subvariantOptions'] }
  | { type: 'close' }

export interface SwapWidgetState {
  token?: string
  isOpen: boolean
  variant: WidgetConfig['subvariantOptions']
}

export function swapWidgetChangeReducer(
  state: SwapWidgetState,
  action: SwapWidgetChangeAction,
): SwapWidgetState {
  switch (action.type) {
    case 'open':
      return { ...state, token: action.token, isOpen: true, variant: action.variant }
    case 'close':
      return { ...state, isOpen: false, token: undefined }
    default:
      return state
  }
}
