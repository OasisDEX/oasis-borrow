import { ReplaySubject } from 'rxjs'

export const redirectState$ = new ReplaySubject<string | undefined>()
