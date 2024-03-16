import type {
  OmniAutomationFormActions,
  OmniAutomationFormState,
} from 'features/omni-kit/state/automation/common/index'
import {
  omniAutomationFormDefault,
  omniAutomationFormReset,
} from 'features/omni-kit/state/automation/common/index'
import { useReducto } from 'helpers/useReducto'

export function useOmniAutomationFormReducto({ ...rest }: Partial<OmniAutomationFormState>) {
  const { dispatch, state, updateState } = useReducto<
    OmniAutomationFormState,
    OmniAutomationFormActions
  >({
    defaults: {
      ...omniAutomationFormDefault,
      ...rest,
    },
    reducer: (prevState: OmniAutomationFormState, action: OmniAutomationFormActions) => {
      switch (action.type) {
        case 'reset':
          return { ...prevState, ...omniAutomationFormReset }
        default:
          return prevState
      }
    },
  })

  return {
    dispatch,
    state,
    updateState,
  }
}
