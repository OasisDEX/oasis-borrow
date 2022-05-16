import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { bindNodeCallback, combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { currentWeek } from './calls/merkleRedeemer'
import { CallObservable } from './calls/observe'
import { Context } from './network'
import { OraclePriceData } from './prices'

export function createCurrentWeek$(
    onEveryBlock$: Observable<number>,
    context$: Observable<Context>,
    currentWeek$: CallObservable<typeof currentWeek>,
) {
    
}
