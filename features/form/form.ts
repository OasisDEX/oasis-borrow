import { BehaviorSubject } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

interface FormState {
  step: number
  canProgress: boolean
  isLoading: boolean
  isRetrying: boolean
  isError: boolean
  isWarning: boolean
  errors: string[]
  warnings: string[]
}

// FORM STATE FACTORY WHICH CAN BE REUSED ACROSS APP
export function createFormState<T>(initialState: T) {
  // COMMON FORM STATE
  const defaultState = {
    step: 1,
    canProgress: false,
    isLoading: false,
    isRetrying: false,
    isError: false,
    isWarning: false,
    errors: [],
    warnings: [],
  }

  const state$ = new BehaviorSubject<FormState & T>({
    ...defaultState,
    ...initialState,
  })

  function getFormState() {
    return state$.getValue()
  }

  function selectFormState<K>(mapFn: (state: FormState & T) => K) {
    return state$.asObservable().pipe(
      map((state) => mapFn(state)),
      distinctUntilChanged(),
    )
  }

  function setFormState<T>(nextState: Partial<FormState & T>) {
    return state$.next({ ...getFormState(), ...nextState })
  }

  function setCanProgress(canProgress: boolean) {
    return state$.next({ ...getFormState(), canProgress })
  }

  function setNextStep() {
    return state$.next({ ...getFormState(), step: getFormState().step + 1 })
  }

  function setPreviousStep() {
    return state$.next({ ...getFormState(), step: getFormState().step - 1 })
  }

  function setIsLoading(isLoading: boolean) {
    return state$.next({ ...getFormState(), isLoading })
  }

  function setIsRetrying(isRetrying: boolean) {
    return state$.next({ ...getFormState(), isRetrying })
  }

  function setIsError(isError: boolean) {
    return state$.next({ ...getFormState(), isError })
  }

  function setIsWarning(isWarning: boolean) {
    return state$.next({ ...getFormState(), isWarning })
  }

  function setErrors(errors: Pick<FormState, 'errors'>) {
    return state$.next({ ...getFormState(), errors })
  }

  function setWarnings(warnings: Pick<FormState, 'warnings'>) {
    return state$.next({ ...getFormState(), warnings })
  }

  return {
    getFormState,
    setFormState,
    setCanProgress,
    selectFormState,
    setNextStep,
    setPreviousStep,
    setIsLoading,
    setIsRetrying,
    setIsError,
    setIsWarning,
    setErrors,
    setWarnings,
  }
}
