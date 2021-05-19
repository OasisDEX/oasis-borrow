import { compareBigNumber, compareDate } from 'helpers/compare'
import { applyChange, Change, Changes, Direction, toggleSort } from 'helpers/form'
import { Observable, of, Subject } from 'rxjs'
import { scan, startWith, switchMap } from 'rxjs/operators'

import { CollateralPrices } from './collateralPrices'

type ColalteralPricesSortBy =
  | 'currentPrice'
  | 'nextPrice'
  | 'currentPriceUpdate'
  | 'nextPriceUpdate'
  | undefined

type ManualChange = Change<CollateralPricesWithFiltersState, 'sortBy'>

type CollateralPricesWithFiltersChanges = Changes<CollateralPricesWithFiltersState>

export interface CollateralPricesWithFiltersState {
  sortBy: ColalteralPricesSortBy
  direction: Direction
  change: (ch: ManualChange) => void
}

function apply(
  state: CollateralPricesWithFiltersState,
  change: CollateralPricesWithFiltersChanges,
): CollateralPricesWithFiltersState {
  switch (change.kind) {
    case 'sortBy':
      const [sortBy, direction] = toggleSort(state.sortBy, state.direction, change.sortBy)
      return {
        ...state,
        sortBy,
        direction,
      }
    default:
      return applyChange(state, change)
  }
}

function sortCollateralPrices(
  collateralPrices: CollateralPrices,
  sortBy: ColalteralPricesSortBy,
  direction: Direction,
) {
  const filter = `${sortBy}_${direction}`

  switch (filter) {
    case 'currentPrice_ASC':
      return collateralPrices.sort((a, b) => compareBigNumber(a.currentPrice, b.currentPrice))
    case 'currentPrice_DESC':
      return collateralPrices.sort((a, b) => compareBigNumber(b.currentPrice, a.currentPrice))
    case 'nextPrice_ASC':
      return collateralPrices.sort((a, b) => compareBigNumber(a.nextPrice, b.nextPrice))
    case 'nextPrice_DESC':
      return collateralPrices.sort((a, b) => compareBigNumber(b.nextPrice, a.nextPrice))
    case 'currentPriceUpdate_ASC':
      return collateralPrices.sort((a, b) =>
        compareDate(a.currentPriceUpdate, b.currentPriceUpdate),
      )
    case 'currentPriceUpdate_DESC':
      return collateralPrices.sort((a, b) =>
        compareDate(b.currentPriceUpdate, a.currentPriceUpdate),
      )
    case 'nextPriceUpdate_ASC':
      return collateralPrices.sort((a, b) => compareDate(a.nextPriceUpdate, b.nextPriceUpdate))
    case 'nextPriceUpdate_DESC':
      return collateralPrices.sort((a, b) => compareDate(b.nextPriceUpdate, a.nextPriceUpdate))
    default:
      return collateralPrices
  }
}

export interface CollateralPricesWithFilters {
  data: CollateralPrices
  filters: CollateralPricesWithFiltersState
}

export function collateralPricesWithFilters$(
  collateralPrices: CollateralPrices,
): Observable<CollateralPricesWithFilters> {
  const change$ = new Subject<ManualChange>()
  function change(ch: ManualChange) {
    change$.next(ch)
  }

  const initialState: CollateralPricesWithFiltersState = {
    sortBy: undefined,
    direction: undefined,
    change,
  }

  return change$.pipe(
    scan(apply, initialState),
    startWith(initialState),
    switchMap((state) =>
      of({
        filters: state,
        data: sortCollateralPrices(collateralPrices, state.sortBy, state.direction),
      }),
    ),
  )
}
