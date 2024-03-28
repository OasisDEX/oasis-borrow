import BigNumber from 'bignumber.js'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { merge, of, Subject } from 'rxjs'
import { catchError, map, scan, shareReplay, startWith, switchMap } from 'rxjs/operators'

import {
  SLIPPAGE_DEFAULT,
  SLIPPAGE_LIMIT_MAX,
  SLIPPAGE_LIMIT_MIN,
  SLIPPAGE_WARNING_THRESHOLD,
} from './userSettings.constants'
import type {
  SaveUserSettingsFunction,
  SlippageChange,
  UserSettingsChange,
  UserSettingsErrorMessages,
  UserSettingsState,
  UserSettingsWarningMessages,
} from './userSettings.types'

function apply(state: UserSettingsState, change: UserSettingsChange): UserSettingsState {
  if (change.kind === 'slippageInput') {
    return {
      ...state,
      slippageInput: change.slippageInput,
      stage: 'editing',
    }
  }

  if (change.kind === 'stage') {
    return {
      ...state,
      stage: change.stage,
    }
  }

  if (change.kind === 'settingsSaved') {
    return {
      ...state,
      slippage: change.slippageInput,
      stage: 'success',
    }
  }

  return state
}

function saveSettings(
  slippageInput: BigNumber,
  change: (ch: UserSettingsChange) => void,
  saveUserSettings$: SaveUserSettingsFunction,
) {
  return saveUserSettings$(slippageInput)
    .pipe(
      map(() => ({ kind: 'settingsSaved', slippageInput } as UserSettingsChange)),
      startWith({ kind: 'stage', stage: 'inProgress' } as UserSettingsChange),
      catchError(() => of({ kind: 'stage', stage: 'failure' } as UserSettingsChange)),
    )
    .subscribe((ch) => change(ch))
}

function addTransitions(
  saveUserSettings$: SaveUserSettingsFunction,
  change: (ch: UserSettingsChange) => void,
  state: UserSettingsState,
): UserSettingsState {
  return {
    ...state,
    saveSettings: () => saveSettings(state.slippageInput, change, saveUserSettings$),
  }
}

function validate(state: UserSettingsState): UserSettingsState {
  const { slippageInput } = state
  const errors: UserSettingsErrorMessages[] = []
  const warnings: UserSettingsWarningMessages[] = []

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

export function createUserSettings$(
  checkUserSettings$: () => Observable<{ slippage: string | null }>,
  saveUserSettings$: SaveUserSettingsFunction,
): Observable<UserSettingsState> {
  return checkUserSettings$().pipe(
    switchMap(({ slippage: initialSlippage }) => {
      const change$ = new Subject<UserSettingsChange>()

      function change(ch: UserSettingsChange) {
        change$.next(ch)
      }

      const slippage = initialSlippage ? new BigNumber(initialSlippage) : SLIPPAGE_DEFAULT

      const initialState: UserSettingsState = {
        stage: 'editing',
        slippage,
        slippageInput: slippage,
        setSlippageInput: (slippageInput: BigNumber) =>
          change({ kind: 'slippageInput', slippageInput }),
        reset: () => change({ kind: 'stage', stage: 'editing' }),
        errors: [],
        warnings: [],
        canProgress: true,
      }

      return merge(change$).pipe(
        scan(apply, initialState),
        map(curry(addTransitions)(saveUserSettings$, change)),
        map(curry(validate)),
        startWith(initialState),
      )
    }),
    shareReplay(1),
  )
}

export function slippageChange$(
  slippageLimit$: Observable<UserSettingsState>,
): Observable<SlippageChange> {
  return slippageLimit$.pipe(
    map(({ slippage }) => ({
      kind: 'slippage',
      slippage,
    })),
  )
}
