import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context, ContextConnected, ContextConnectedReadOnly } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { Observable, of, iif } from 'rxjs'
import { mergeMap, startWith, switchMap, map } from 'rxjs/operators'
import {
  createOpenVaultConnected$,
  OpenVaultConnectedStage,
  OpenVaultConnectedState,
} from './openVaultConnected'
import {
  createOpenVaultReadonly$,
  OpenVaultReadonlyStage,
  OpenVaultReadonlyState,
} from './openVaultReadonly'

interface BasicOpenVaultState {
  isIlkValidationStage: boolean
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean
}

export type IlkValidationStage =
  | 'ilkValidationLoading'
  | 'ilkValidationFailure'
  | 'ilkValidationSuccess'

export interface IlkValidationState {
  stage: IlkValidationStage
  ilk: string
}

function createIlkValidation$(
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<IlkValidationState> {
  const initialState: IlkValidationState = {
    ilk,
    stage: 'ilkValidationLoading',
  }

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

export type OpenVaultStage = IlkValidationStage | OpenVaultConnectedStage | OpenVaultReadonlyStage
export type OpenVaultState = BasicOpenVaultState &
  (IlkValidationState | OpenVaultConnectedState | OpenVaultReadonlyState)

function applyIsStageStates(
  state: IlkValidationState | OpenVaultConnectedState | OpenVaultReadonlyState,
): OpenVaultState {
  const newState = {
    ...state,
    isIlkValidationStage: false,
    isEditingStage: false,
    isProxyStage: false,
    isAllowanceStage: false,
    isOpenStage: false,
  }

  switch (state.stage) {
    case 'ilkValidationFailure':
    case 'ilkValidationLoading':
    case 'ilkValidationSuccess':
      return {
        ...newState,
        isIlkValidationStage: true,
      }
    case 'editingReadonly':
    case 'editingConnected':
      return {
        ...newState,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxyWaitToContinue':
      return {
        ...newState,
        isProxyStage: true,
      }
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceWaitToContinue':
      return {
        ...newState,
        isAllowanceStage: true,
      }
    case 'openWaitingForConfirmation':
    case 'openWaitingForApproval':
    case 'openInProgress':
    case 'openFailure':
    case 'openWaitToContinue':
      return {
        ...newState,
        isOpenStage: true,
      }
  }
}

export function createOpenVault$(
  context$: Observable<Context>,
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
    mergeMap((state) =>
      iif(
        () => state.stage !== 'ilkValidationSuccess',
        of(state),
        context$.pipe(
          mergeMap((context) => {
            const token = ilk.split('-')[0]
            return iif(
              () => context.status === 'connectedReadonly',
              createOpenVaultReadonly$(context as ContextConnectedReadOnly, ilk, token),
              createOpenVaultConnected$(
                txHelpers$,
                proxyAddress$,
                allowance$,
                tokenOraclePrice$,
                balance$,
                ilkData$,
                context as ContextConnected,
                ilk,
                token,
              ),
            )
          }),
        ),
      ),
    ),
    map(applyIsStageStates),
  )
}
