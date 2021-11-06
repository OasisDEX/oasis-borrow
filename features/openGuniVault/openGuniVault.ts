import { BigNumber } from 'bignumber.js'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import {
  createExchangeChange$,
  createInitialQuoteChange,
} from 'features/openMultiplyVault/openMultiplyQuote'
import { AllowanceStages, ProxyStages, TxStage } from 'features/openMultiplyVault/openMultiplyVault'
import { BalanceInfo, balanceInfoChange$ } from 'features/shared/balanceInfo'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { GasEstimationStatus } from 'helpers/form'
import { curry } from 'lodash'
import { pipe } from 'ramda'
import { combineLatest, iif, merge, Observable, of, Subject, throwError } from 'rxjs'
import { catchError, first, map, scan, shareReplay, switchMap, tap } from 'rxjs/internal/operators'
import {
  FormChanges,
  FormFunctions,
  FormState,
  applyFormChange,
  addFormTransitions,
  defaultFormState,
  EditingStage,
} from './guniForm'
import { EnvironmentState, EnvironmentChange, applyEnvironment } from './enviroment'

type AnyChange = any

type InjectChange = { kind: 'injectStateOverride'; stateToOverride: OpenGuniVaultState }

interface OverrideHelper {
  injectStateOverride: (state: Partial<any>) => void
}

export type Stage = EditingStage | ProxyStages | AllowanceStages | TxStage

interface StageState {
  stage: Stage
}

enum AllowanceOption {
  UNLIMITED,
  DEPOSIT_AMOUNT,
  CUSTOM,
}

interface VaultTxInfo {
  allowanceTxHash?: string
  proxyTxHash?: string
  actionTxHash?: string // different then in rest
  txError?: any
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
}

interface AllowanceSate {
  selectedAllowanceRadio: AllowanceOption
  allowanceAmount?: BigNumber
}

interface AllowanceFunctions {
  setAllowanceAmountUnlimited?: () => void
  setAllowanceAmountToDepositAmount?: () => void
  setAllowanceAmountCustom?: () => void
}

interface StageFunctions {
  progress?: () => void
  regress?: () => void
  clear: () => void
}

export type StageChange =
  | {
      kind: 'progressEditing'
    }
  | {
      kind: 'progressProxy'
    }
  | {
      kind: 'backToEditing'
    }
  | {
      kind: 'regressAllowance'
    }
  | {
      kind: 'clear'
    }

interface ExchangeState {
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
}

type OpenGuniChanges = EnvironmentChange | FormChanges | InjectChange

type ErrorState = {
  errorMessages: string[] // TODO add errors
}

type WarringState = {
  warningMessages: string[] // TODO add warring
}

type OpenGuniVaultState = OverrideHelper &
  StageState &
  StageFunctions &
  AllowanceSate &
  AllowanceFunctions &
  FormFunctions &
  FormState &
  EnvironmentState &
  ExchangeState &
  VaultTxInfo &
  ErrorState &
  WarringState

function combineApply<S, Ch>(
  ...applyFunctions: ((state: S, change: AnyChange) => S)[]
): (state: S, change: Ch) => S {
  return (state: S, change: Ch) =>
    applyFunctions.reduce((nextState, apply) => apply(nextState, change), state)
}

const apply = combineApply<OpenGuniVaultState, OpenGuniChanges>(applyEnvironment, applyFormChange)
export function createOpenGuniVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilks$: Observable<string[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  //   exchangeQuote$: (
  //     token: string,
  //     slippage: BigNumber,
  //     amount: BigNumber,
  //     action: ExchangeAction,
  //   ) => Observable<Quote>,
  //   addGasEstimation$: AddGasEstimationFunction,
  ilk: string,
): Observable<OpenGuniVaultState> {
  return ilks$.pipe(
    switchMap((ilks) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        combineLatest(context$, txHelpers$, ilkData$(ilk)).pipe(
          first(),
          switchMap(([context, txHelpers, ilkData]) => {
            const { token } = ilkData
            const tokenInfo = getToken(token)

            if (!tokenInfo.token1 || !tokenInfo.token2) {
              throw new Error('Missing tokens in configuration')
            }

            console.log('&*W(&(*#&*(&(*&(*&(*&(*&(')

            const account = context.account
            return combineLatest(
              priceInfo$(token),
              balanceInfo$(tokenInfo.token1, account),
              proxyAddress$(account),
            ).pipe(
              first(),
              switchMap(([priceInfo, balanceInfo, proxyAddress]) =>
                (
                  (proxyAddress &&
                    tokenInfo.token1 &&
                    allowance$(tokenInfo.token1, account, proxyAddress)) ||
                  of(undefined)
                ).pipe(
                  first(),
                  switchMap((allowance) => {
                    const change$ = new Subject<OpenGuniChanges>()

                    function change(ch: OpenGuniChanges) {
                      change$.next(ch)
                    }

                    // NOTE: Not to be used in production/dev, test only
                    function injectStateOverride(stateToOverride: Partial<OpenGuniVaultState>) {
                      return change$.next({ kind: 'injectStateOverride', stateToOverride })
                    }

                    // const totalSteps = calculateInitialTotalSteps(proxyAddress, token, allowance)

                    const initialState: OpenGuniVaultState = {
                      stage: 'editing',
                      ...defaultFormState,

                      //   ...defaultMutableOpenMultiplyVaultState,
                      //   ...defaultOpenMultiplyVaultStateCalculations,
                      //   ...defaultOpenMultiplyVaultConditions,

                      priceInfo,
                      balanceInfo,
                      ilkData,
                      token,
                      account,
                      ilk,
                      proxyAddress,
                      allowance,
                      safeConfirmations: context.safeConfirmations,
                      etherscan: context.etherscan.url,
                      errorMessages: [],
                      warningMessages: [],
                      //   summary: defaultOpenVaultSummary,
                      // slippage: SLIPPAGE,
                      // totalSteps,
                      // currentStep: 1,
                      exchangeError: false,
                      clear: () => change({ kind: 'clear' }),
                      // gasEstimationStatus: GasEstimationStatus.unset,
                      injectStateOverride,
                    }

                    const stateSubject$ = new Subject<OpenGuniVaultState>()

                    const environmentChanges$ = merge(
                      priceInfoChange$(priceInfo$, token),
                      balanceInfoChange$(balanceInfo$, token, account),
                      createIlkDataChange$(ilkData$, ilk),
                      //   createInitialQuoteChange(exchangeQuote$, token),
                      //   createExchangeChange$(exchangeQuote$, stateSubject$),
                    )

                    const connectedProxyAddress$ = proxyAddress$(account)

                    return merge(change$, environmentChanges$).pipe(
                      scan(apply, initialState),
                      //   map(validateErrors),
                      //   map(validateWarnings),
                      //   switchMap(curry(applyEstimateGas)(addGasEstimation$)),
                      //   map(
                      //     curry(addTransitions)(txHelpers, context, connectedProxyAddress$, change),
                      //   ),
                      map((state) => addFormTransitions(state, change)),
                      tap((state) => stateSubject$.next(state)),
                    )
                  }),
                ),
              ),
            )
          }),
        ),
      ),
    ),
    shareReplay(1),
  )
}
