import BigNumber from 'bignumber.js'
import { curry } from 'lodash'
import { merge, Observable, of, Subject } from 'rxjs'
import { catchError, map, scan, shareReplay, startWith, switchMap } from 'rxjs/operators'

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

export const SLIPPAGE_DEFAULT = new BigNumber(0.005)
const SLIPPAGE_LOW = new BigNumber(0.005)
const SLIPPAGE_MEDIUM = new BigNumber(0.01)
const SLIPPAGE_HIGH = new BigNumber(0.02)
export const SLIPPAGE_WARNING_THRESHOLD = new BigNumber(0.05)
const SLIPPAGE_LIMIT_MAX = new BigNumber(0.2)
const SLIPPAGE_LIMIT_MIN = new BigNumber(0.001)

export const SLIPPAGE_OPTIONS = [SLIPPAGE_LOW, SLIPPAGE_MEDIUM, SLIPPAGE_HIGH]

type SaveSlippageFunction = (slippageInput: BigNumber) => Observable<boolean>

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

function saveSlippage(
  slippageInput: BigNumber,
  change: (ch: SlippageLimitChange) => void,
  saveSlippage$: SaveSlippageFunction,
) {
  return saveSlippage$(slippageInput)
    .pipe(
      map(() => ({ kind: 'slippageSaved', slippageInput } as SlippageLimitChange)),
      startWith({ kind: 'stage', stage: 'inProgress' } as SlippageLimitChange),
      catchError(() => of({ kind: 'stage', stage: 'failure' } as SlippageLimitChange)),
    )
    .subscribe((ch) => change(ch))
}

function addTransitions(
  saveSlippage$: SaveSlippageFunction,
  change: (ch: SlippageLimitChange) => void,
  state: SlippageLimitState,
): SlippageLimitState {
  return {
    ...state,
    saveSlippage: () => saveSlippage(state.slippageInput, change, saveSlippage$),
  }
}

function validate(state: SlippageLimitState): SlippageLimitState {
  const { slippageInput } = state
  const errors: SlippageLimitErrorMessages[] = []
  const warnings: SlippageLimitWarningMessages[] = []

  const invalidSlippage =
    !slippageInput ||
    slippageInput.isNaN() ||
    (slippageInput &&
      (slippageInput.gt(SLIPPAGE_LIMIT_MAX) || slippageInput.lt(SLIPPAGE_LIMIT_MIN)))

  if (invalidSlippage) {
    errors.push('invalidSlippage')
  }

  if (!invalidSlippage && slippageInput.gt(SLIPPAGE_WARNING_THRESHOLD)) {
    warnings.push('highSlippage')
  }

  const canProgress = errors.length === 0

  return { ...state, errors, warnings, canProgress }
}

export function createSlippageLimit$(
  checkSlippage$: () => Observable<{ slippage: string | null }>,
  saveSlippage$: SaveSlippageFunction,
): Observable<SlippageLimitState> {
  return checkSlippage$().pipe(
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
        map(curry(addTransitions)(saveSlippage$, change)),
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
