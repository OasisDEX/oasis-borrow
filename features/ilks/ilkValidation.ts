import { Observable, of } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'

type IlkValidationStatus = 'ilkValidationLoading' | 'ilkValidationFailure' | 'ilkValidationSuccess'

export interface IlkValidationState {
  status: IlkValidationStatus
  ilk: string
}

export function createIlkValidation$(
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<IlkValidationState> {
  return ilks$.pipe(
    switchMap((ilks) => {
      const isValidIlk = ilks.some((i) => i === ilk)
      if (!isValidIlk) {
        return of({
          ilk,
          status: 'ilkValidationFailure',
        })
      }
      return of({
        ilk,
        status: 'ilkValidationSuccess',
      })
    }),
    startWith({ ilk, status: 'ilkValidationLoading' } as IlkValidationState),
  )
}
