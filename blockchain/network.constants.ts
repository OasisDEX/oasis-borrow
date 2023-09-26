import { interval } from 'rxjs'
import { startWith } from 'rxjs/operators'

export const every1Seconds$ = interval(1000).pipe(startWith(0))
export const every3Seconds$ = interval(3000).pipe(startWith(0))
export const every5Seconds$ = interval(5000).pipe(startWith(0))
export const every10Seconds$ = interval(10000).pipe(startWith(0))
