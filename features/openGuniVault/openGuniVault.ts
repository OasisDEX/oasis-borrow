import { BigNumber } from 'bignumber.js'
import { createIlkDataChange$, IlkData, IlkDataChange } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import {
  createExchangeChange$,
  createInitialQuoteChange,
} from 'features/openMultiplyVault/openMultiplyQuote'
import {
  AllowanceStages,
  EditingStage,
  ProxyStages,
  TxStage,
} from 'features/openMultiplyVault/openMultiplyVault'
import { BalanceInfo, BalanceInfoChange, balanceInfoChange$ } from 'features/shared/balanceInfo'
import { PriceInfo, PriceInfoChange, priceInfoChange$ } from 'features/shared/priceInfo'
import { GasEstimationStatus } from 'helpers/form'
import { curry } from 'lodash'
import { pipe } from 'ramda'
import { combineLatest, iif, merge, Observable, of, Subject, throwError } from 'rxjs'
import { catchError, first, map, scan, shareReplay, switchMap, tap } from 'rxjs/internal/operators'

interface OpenGuniVault {}

type OpenGuniVaultChange = any

interface OverrideHelper {
  injectStateOverride: (state: Partial<any>) => void
}

export type Stage = EditingStage | ProxyStages | AllowanceStages | TxStage

enum AllowanceOption {
  UNLIMITED,
  DEPOSIT_AMOUNT,
  CUSTOM,
}

interface FormState {
  depositAmount?: BigNumber
}

interface FormFunctions {
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositMax?: () => void
  updateAllowanceAmount?: (amount?: BigNumber) => void
  clear: () => void
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
}

interface EnvironmentState {
  ilk: string
  account: string
  token: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  proxyAddress?: string
  allowance?: BigNumber
}

export type EnvironmentChange = PriceInfoChange | BalanceInfoChange | IlkDataChange
export function applyEnvironment<Ch extends EnvironmentChange, S extends EnvironmentState>( //split it into even smaller parts
  state: S,
  change: Ch,
): S {
  if (change.kind === 'priceInfo') {
    return {
      ...state,
      priceInfo: change.priceInfo,
    }
  }

  if (change.kind === 'balanceInfo') {
    return {
      ...state,
      balanceInfo: change.balanceInfo,
    }
  }

  if (change.kind === 'ilkData') {
    return {
      ...state,
      ilkData: change.ilkData,
    }
  }

  return state
}

interface ExchangeState {
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
}

type OpenGuniVaultState = OverrideHelper &
  StageFunctions &
  AllowanceSate &
  AllowanceFunctions &
  FormFunctions &
  FormState &
  EnvironmentState &
  ExchangeState &
  VaultTxInfo

type FormChanges = { kind: 'depositAmount'; depositAmount: BigNumber }
type OpenGuniChanges = EnvironmentChange | FormChanges

function applyFormChange<S extends FormState = FormState, Ch extends FormChanges = FormChanges>(
  state: S,
  changes: Ch,
) {
  return state
}

function combineApply<S, Ch>(
  ...applyFunctions: ((state: S, change: Ch) => S)[]
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
): Observable<OpenGuniVault> {
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
                    const change$ = new Subject<OpenGuniVaultChange>()

                    function change(ch: OpenGuniVaultChange) {
                      change$.next(ch)
                    }

                    // NOTE: Not to be used in production/dev, test only
                    function injectStateOverride(stateToOverride: Partial<OpenGuniVault>) {
                      return change$.next({ kind: 'injectStateOverride', stateToOverride })
                    }

                    // const totalSteps = calculateInitialTotalSteps(proxyAddress, token, allowance)

                    const initialState: OpenGuniVaultChange = {
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
                      currentStep: 1,
                      exchangeError: false,
                      clear: () => change({ kind: 'clear' }),
                      gasEstimationStatus: GasEstimationStatus.unset,
                      injectStateOverride,
                    }

                    const stateSubject$ = new Subject<OpenGuniVaultChange>()

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
    catchError((err) => {
      console.log(err)

      return of({})
    }),
  )
}
