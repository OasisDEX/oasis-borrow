import BigNumber from 'bignumber.js'
import { curry } from 'lodash'
import { merge, Observable, of, Subject } from 'rxjs'
import { catchError, map, scan, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { checkSlippageLocalStorage$, saveSlippageLocalStorage$ } from './slippageLimitLocal'

type SlippageLimitStage = 'editing' | 'inProgress' | 'success' | 'failure'

export type SlippageLimitErrorMessages = 'invalidSlippage'

export type SlippageLimitWarningMessages = 'highSlippage'

export interface SlippageLimitState {
  stage: SlippageLimitStage
  slippage: BigNumber
  slippageInput: BigNumber
  setSlippageLow: () => void
  setSlippageMedium: () => void
  setSlippageHigh: () => void
  setSlippageCustom: (slippageInput: BigNumber) => void
  saveSlippage?: () => void
  reset: () => void
  errors: SlippageLimitErrorMessages[]
  warnings: SlippageLimitWarningMessages[]
  canProgress: boolean
}

type SlippageLimitChange =
  | { kind: 'stage'; stage: SlippageLimitStage }
  | { kind: 'slippageSaved'; slippageInput: BigNumber }
  | { kind: 'slippageInput'; slippageInput: BigNumber }

export const SLIPPAGE_DEFAULT = new BigNumber(0.5)
const SLIPPAGE_LOW = new BigNumber(0.5)
const SLIPPAGE_MEDIUM = new BigNumber(1)
const SLIPPAGE_HIGH = new BigNumber(2)

export const SLIPPAGE_OPTIONS = [SLIPPAGE_LOW, SLIPPAGE_MEDIUM, SLIPPAGE_HIGH]

function apply(state: SlippageLimitState, change: SlippageLimitChange): SlippageLimitState {
  if (change.kind === 'slippageInput') {
    return {
      ...state,
      slippageInput: change.slippageInput,
    }
  }

  if (change.kind === 'stage') {
    return {
      ...state,
      stage: change.stage,
    }
  }

  if (change.kind === 'slippageSaved') {
    return {
      ...state,
      slippage: change.slippageInput,
      stage: 'success',
    }
  }

  return state
}

function saveSlippage(slippageInput: BigNumber, change: (ch: SlippageLimitChange) => void) {
  return saveSlippageLocalStorage$(slippageInput)
    .pipe(
      map(() => ({ kind: 'slippageSaved', slippageInput } as SlippageLimitChange)),
      startWith({ kind: 'stage', stage: 'inProgress' } as SlippageLimitChange),
      catchError(() => of({ kind: 'stage', stage: 'failure' } as SlippageLimitChange)),
    )
    .subscribe((ch) => change(ch))
}

function addTransitions(
  change: (ch: SlippageLimitChange) => void,
  state: SlippageLimitState,
): SlippageLimitState {
  return {
    ...state,
    saveSlippage: () => saveSlippage(state.slippageInput, change),
  }
}

function validate(state: SlippageLimitState): SlippageLimitState {
  const { slippageInput } = state
  const errors: SlippageLimitErrorMessages[] = []
  const warnings: SlippageLimitWarningMessages[] = []

  const invalidSlippage =
    !slippageInput ||
    slippageInput.isNaN() ||
    (slippageInput && (slippageInput.gt(new BigNumber(20)) || slippageInput.lt(new BigNumber(0.1))))

  if (invalidSlippage) {
    errors.push('invalidSlippage')
  }

  if (!invalidSlippage && slippageInput.gt(new BigNumber(5))) {
    warnings.push('highSlippage')
  }

  const canProgress = errors.length === 0

  return { ...state, errors, warnings, canProgress }
}

export function createSlippageLimit$(): Observable<SlippageLimitState> {
  return checkSlippageLocalStorage$().pipe(
    switchMap(({ slippage: initialSlippage }) => {
      const change$ = new Subject<SlippageLimitChange>()

      function change(ch: SlippageLimitChange) {
        change$.next(ch)
      }

      const slippage = initialSlippage ? new BigNumber(initialSlippage) : SLIPPAGE_DEFAULT

      const initialState: SlippageLimitState = {
        stage: 'editing',
        slippage,
        slippageInput: slippage,
        setSlippageLow: () => change({ kind: 'slippageInput', slippageInput: SLIPPAGE_LOW }),
        setSlippageMedium: () => change({ kind: 'slippageInput', slippageInput: SLIPPAGE_MEDIUM }),
        setSlippageHigh: () => change({ kind: 'slippageInput', slippageInput: SLIPPAGE_HIGH }),
        setSlippageCustom: (slippageInput: BigNumber) =>
          change({ kind: 'slippageInput', slippageInput }),
        reset: () => change({ kind: 'stage', stage: 'editing' }),
        errors: [],
        warnings: [],
        canProgress: true,
      }

      return merge(change$).pipe(
        scan(apply, initialState),
        map(curry(addTransitions)(change)),
        map(curry(validate)),
        startWith(initialState),
      )
    }),
    shareReplay(1),
  )
}

export interface SlippageChange {
  kind: 'slippage'
  slippage: BigNumber
}

export function slippageChange$(
  slippageLimit$: Observable<SlippageLimitState>,
): Observable<SlippageChange> {
  return slippageLimit$.pipe(
    map(({ slippage }) => ({
      kind: 'slippage',
      slippage,
    })),
  )
}
