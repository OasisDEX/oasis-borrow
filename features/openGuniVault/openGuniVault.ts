import { BigNumber } from 'bignumber.js'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'

import { BalanceInfo, balanceInfoChange$ } from 'features/shared/balanceInfo'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { GasEstimationStatus } from 'helpers/form'
import { combineLatest, EMPTY, iif, merge, Observable, of, Subject, throwError } from 'rxjs'
import { filter, first, map, scan, shareReplay, switchMap, tap } from 'rxjs/internal/operators'
import {
  FormChanges,
  FormFunctions,
  FormState,
  applyFormChange,
  addFormTransitions,
  defaultFormState,
  EditingStage,
  applyIsEditingStage,
  DepositChange,
} from './guniForm'
import { EnvironmentState, EnvironmentChange, applyEnvironment } from './enviroment'
import {
  addProxyTransitions,
  applyIsProxyStage,
  applyProxyChanges,
  defaultProxyStage,
  ProxyChanges,
  ProxyStages,
  ProxyState,
} from 'features/proxy/proxy'
import {
  applyAllowanceChanges,
  AllowanceChanges,
  AllowanceState,
  AllowanceFunctions,
  defaultAllowanceState,
  allowanceTransitions,
  applyIsAllowanceStage,
  AllowanceStages,
  applyAllowanceConditions,
} from 'features/allowance/allowance'
import { combineTransitions } from '../../helpers/pipelines/combineTransitions'
import { combineApplyChanges } from '../../helpers/pipelines/combineApply'

import { TxStage } from 'features/openMultiplyVault/openMultiplyVault' // TODO: remove
import { one, zero } from 'helpers/zero'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { observe } from 'blockchain/calls/observe'
import { getToken1Balance } from './guniActionsCalls'
import { VaultErrorMessage, VaultWarningMessage } from '../openMultiplyVault/openMultiplyVaultValidations'

type InjectChange = { kind: 'injectStateOverride'; stateToOverride: OpenGuniVaultState }

interface OverrideHelper {
  injectStateOverride: (state: Partial<any>) => void
}

export type Stage = EditingStage | ProxyStages | AllowanceStages | TxStage

interface StageState {
  stage: Stage
}

interface VaultTxInfo {
  txError?: any
  etherscan?: string
  safeConfirmations: number
}

interface StageFunctions {
  progress?: () => void
  regress?: () => void
  clear: () => void
}

interface ExchangeState {
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
}

type ExchangeChange = { kind: 'quote'; quote: Quote } | { kind: 'swap'; swap: Quote }

function createInitialQuoteChange(
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  token: string,
): Observable<ExchangeChange> {
  return exchangeQuote$(token, new BigNumber(0.1), new BigNumber(1), 'BUY_COLLATERAL').pipe(
    map((quote) => ({ kind: 'quote' as const, quote })),
    shareReplay(1),
  )
}

function applyExchange<S extends ExchangeState>(state: S, change: ExchangeChange): S {
  switch (change.kind) {
    case 'quote':
      return { ...state, quote: change.quote }
    case 'swap':
      return { ...state, swap: change.swap }
    default:
      return state
  }
}

type OpenGuniChanges =
  | EnvironmentChange
  | FormChanges
  | InjectChange
  | ProxyChanges
  | AllowanceChanges

type ErrorState = {
  errorMessages: VaultErrorMessage[] // TODO add errors
}

type WarringState = {
  warningMessages: VaultWarningMessage[] // TODO add warring
}

export type OpenGuniVaultState = OverrideHelper &
  StageState &
  StageFunctions &
  AllowanceState &
  AllowanceFunctions &
  FormFunctions &
  FormState &
  EnvironmentState &
  ExchangeState &
  VaultTxInfo &
  ErrorState &
  WarringState &
  ProxyState &
  GuniCalculations &
  TokensLpBalanceState & {
    // TODO - ADDED BY SEBASTIAN TO BE REMOVED
    isOpenStage: boolean
    afterOutstandingDebt: BigNumber
    multiply: BigNumber
    totalCollateral: BigNumber // it was not available in standard multiply state
    afterNetValueUSD: BigNumber
    maxDepositAmount: BigNumber
    txFees: BigNumber
    impact: BigNumber
    loanFees: BigNumber
    oazoFee: BigNumber
    slippage: BigNumber
    isExchangeLoading: boolean
    gettingCollateral: BigNumber // it was not available in standard multiply state
    gettingCollateralUSD: BigNumber // it was not available in standard multiply state
    buyingCollateralUSD: BigNumber
    maxGenerateAmount: BigNumber
    totalSteps: number
    currentStep: number
    canRegress: boolean
    canProgress: boolean
    isLoadingStage: boolean
    insufficientAllowance: boolean
    inputAmountsEmpty: boolean
    customAllowanceAmountEmpty: boolean
    updateAllowanceAmount?: (amount?: BigNumber) => void
    netValueUSD: BigNumber
  }

interface GuniCalculations {
  leveragedAmount?: BigNumber
  flAmount?: BigNumber
}

function applyCalculations<S extends { ilkData: IlkData; depositAmount?: BigNumber }>(
  state: S,
): S & GuniCalculations {
  // TODO: missing fees
  const leveragedAmount = state.depositAmount
    ? state.depositAmount.div(state.ilkData.liquidationRatio.minus(one))
    : zero
  const flAmount = state.depositAmount ? leveragedAmount.minus(state.depositAmount) : zero

  return {
    ...state,
    leveragedAmount,
    flAmount,
  }
}

interface TokensLpBalanceState {
  token0Amount?: BigNumber
  token1Amount?: BigNumber
}

export function createOpenGuniVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilks$: Observable<string[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  onEveryBlock$: Observable<number>,
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

            if (!tokenInfo.token0 || !tokenInfo.token1) {
              throw new Error('Missing tokens in configuration')
            }

            const account = context.account
            return combineLatest(
              priceInfo$(token),
              balanceInfo$(tokenInfo.token0, account),
              proxyAddress$(account),
            ).pipe(
              first(),
              switchMap(([priceInfo, balanceInfo, proxyAddress]) =>
                (
                  (proxyAddress &&
                    tokenInfo.token0 &&
                    allowance$(tokenInfo.token0, account, proxyAddress)) ||
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
                    const SLIPPAGE = new BigNumber(0.1)

                    const initialState: OpenGuniVaultState = {
                      ...defaultFormState,
                      ...defaultAllowanceState,
                      ...defaultProxyStage,
                      stage: 'editing',
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
                      exchangeError: false,
                      //   summary: defaultOpenVaultSummary,
                      slippage: SLIPPAGE,

                      // totalSteps,
                      // currentStep: 1,
                      // exchangeError: false,
                      clear: () => change({ kind: 'clear' }),
                      // gasEstimationStatus: GasEstimationStatus.unset,
                      injectStateOverride,
                      // TODO - ADDED BY SEBASTIAN TO BE REMOVED
                      isOpenStage: false,
                      afterOutstandingDebt: new BigNumber(1000),
                      multiply: new BigNumber(1000),
                      totalCollateral: new BigNumber(1000), // it was not available in standard multiply state
                      afterNetValueUSD: new BigNumber(1000),
                      maxDepositAmount: new BigNumber(1000),
                      txFees: new BigNumber(1000),
                      impact: new BigNumber(1000),
                      loanFees: new BigNumber(1000),
                      oazoFee: new BigNumber(1000),
                      isExchangeLoading: false,
                      gettingCollateral: new BigNumber(1000), // it was not available in standard multiply state
                      gettingCollateralUSD: new BigNumber(1000), // it was not available in standard multiply state
                      buyingCollateralUSD: new BigNumber(1000),
                      maxGenerateAmount: new BigNumber(1000),
                      totalSteps: 3,
                      currentStep: 1,
                      canRegress: false,
                      canProgress: false,
                      isLoadingStage: false,
                      insufficientAllowance: true,
                      customAllowanceAmountEmpty: false,
                      inputAmountsEmpty: true,
                      netValueUSD: new BigNumber(1000)
                    }

                    const stateSubject$ = new Subject<OpenGuniVaultState>()

                    const token1Balance$ = observe(onEveryBlock$, context$, getToken1Balance)

                    type token1AmountChange = { kind: 'token1Amount'; token1Amount: BigNumber }
                    const token1AmountChanges$: Observable<token1AmountChange> = change$.pipe(
                      filter((change) => change.kind === 'depositAmount'),
                      switchMap((change: DepositChange) => {
                        const { leveragedAmount } = applyCalculations({
                          ilkData,
                          depositAmount: change.depositAmount,
                        })

                        if (!leveragedAmount || leveragedAmount.isZero()) {
                          return of(zero)
                        }

                        return token1Balance$({
                          token,
                          leveragedAmount,
                        })
                      }),
                      // switchMap((token1Amount) => {
                      //   // GIVEN
                      // }),
                      map((token1Amount) => ({
                        kind: 'token1Amount',
                        token1Amount,
                      })),
                    )

                    function applyLpTokensChanges<
                      S extends TokensLpBalanceState & GuniCalculations,
                      Ch extends token1AmountChange
                    >(state: S, change: Ch): S {
                      if (change.kind === 'token1Amount') {
                        const token0Amount =
                          state.leveragedAmount?.minus(change.token1Amount) || zero
                        return {
                          ...state,
                          token1Amount: change.token1Amount,
                          token0Amount,
                        }
                      }
                      return state
                    }

                    const apply = combineApplyChanges<OpenGuniVaultState, OpenGuniChanges>(
                      applyEnvironment,
                      applyFormChange,
                      applyProxyChanges,
                      applyAllowanceChanges,
                      applyExchange,
                      applyLpTokensChanges,
                    )

                    const environmentChanges$ = merge(
                      priceInfoChange$(priceInfo$, token),
                      balanceInfoChange$(balanceInfo$, token, account),
                      createIlkDataChange$(ilkData$, ilk),
                      createInitialQuoteChange(exchangeQuote$, tokenInfo.token1),
                      token1AmountChanges$,
                      //createExchangeChange$(exchangeQuote$, stateSubject$),
                    )

                    const connectedProxyAddress$ = proxyAddress$(account)

                    const applyTransition = combineTransitions<OpenGuniVaultState>( // TODO: can we do it better?
                      (state) => addFormTransitions(change, state),
                      (state) =>
                        addProxyTransitions(txHelpers, connectedProxyAddress$, change, state),
                      (state) =>
                        allowanceTransitions(
                          txHelpers,
                          change,
                          { tokenToAllow: tokenInfo.token0 },
                          state,
                        ),
                      // (state) => openGuniVaultTransitions,
                    )

                    const applyStages = combineTransitions<OpenGuniVaultState>(
                      applyIsEditingStage,
                      applyIsProxyStage,
                      applyIsAllowanceStage,
                      applyAllowanceConditions,
                      applyCalculations,
                    )

                    return merge(change$, environmentChanges$).pipe(
                      scan(apply, initialState),
                      map(applyStages),
                      //   map(validateErrors),
                      //   map(validateWarnings),
                      //   switchMap(curry(applyEstimateGas)(addGasEstimation$)),
                      //   map(
                      //     curry(addTransitions)(txHelpers, context, connectedProxyAddress$, change),
                      //   ),
                      map(applyTransition),
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
