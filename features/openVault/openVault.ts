import { Context } from 'blockchain/network'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type OpenVaultStage =
  | 'editing'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFiasco'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFiasco'
  | 'waitToContinue'
  | 'transactionWaitingForConfirmation'
  | 'transactionWaitingForApproval'
  | 'transactionInProgress'
  | 'transactionFiasco'
  | 'transactionSuccess'

export interface OpenVaultState {
  stage: OpenVaultStage
  isValidIlk: boolean
  ilk: string
}

export function createOpenVault$(
  context$: Observable<Context>,
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<OpenVaultState> {
  return ilks$.pipe(
    switchMap((ilks) => {
      if (!ilks.some((i) => i === ilk)) {
        return of({ stage: 'editing', isValidIlk: false, ilk })
      }

      return of({ stage: 'editing', isValidIlk: true, ilk })
    }),
  )
}
