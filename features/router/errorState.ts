import { BehaviorSubject } from 'rxjs'

export const errorState$ = new BehaviorSubject<string | undefined>(undefined)
