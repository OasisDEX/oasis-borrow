import { BehaviorSubject, Subject } from 'rxjs'

export function createReadonlyAccount$(): Subject<string | undefined> {
  const account$ = new BehaviorSubject<string | undefined>(undefined)
  return account$
}
