import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { combineLatest, Observable, of, iif } from 'rxjs'
import { mergeMap, startWith, switchMap } from 'rxjs/operators'

interface PersistentOpenVaultState {
  isIlkValidationStage: boolean
  ilk: string
}

export type IlkValidationStage =
  | 'ilkValidationLoading'
  | 'ilkValidationFailure'
  | 'ilkValidationSuccess'

export interface IlkValidationState extends PersistentOpenVaultState {
  stage: IlkValidationStage
}

function createIlkValidation$(
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<IlkValidationState> {
  const initialState = {
    ilk,
    isIlkValidationStage: true,
    stage: 'ilkValidationLoading',
  } as IlkValidationState

  return ilks$.pipe(
    switchMap((ilks) => {
      const isValidIlk = ilks.some((i) => i === ilk)
      if (!isValidIlk) {
        return of({
          ...initialState,
          stage: 'ilkValidationFailure',
        })
      }
      return of({
        ...initialState,
        stage: 'ilkValidationSuccess',
      })
    }),
    startWith(initialState),
  )
}

export type OpenVaultStage =
  | IlkValidationStage
  | 'editing'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'waitToContinue'
  | 'transactionWaitingForConfirmation'
  | 'transactionWaitingForApproval'
  | 'transactionInProgress'
  | 'transactionFailure'
  | 'transactionSuccess'

export type OpenVaultState = IlkValidationState | { stage: 'editing' }

export function createOpenVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<OpenVaultState> {
  return createIlkValidation$(ilks$, ilk).pipe(
    mergeMap((ilkValidationState) =>
      iif(
        () => ilkValidationState.stage === 'ilkValidationSuccess',
        of({ stage: 'editing' }),
        of(ilkValidationState),
      ),
    ),
  )
}
