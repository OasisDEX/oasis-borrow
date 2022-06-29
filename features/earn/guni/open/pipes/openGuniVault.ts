import { BigNumber } from 'bignumber.js'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { compareBigNumber, ContextConnected } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import {
  AllowanceChanges,
  AllowanceFunctions,
  AllowanceStages,
  AllowanceState,
  allowanceTransitions,
  applyAllowanceChanges,
  applyAllowanceConditions,
  applyIsAllowanceStage,
  defaultAllowanceState,
} from 'features/allowance/allowance'
import { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { TxStage } from 'features/multiply/open/pipes/openMultiplyVault' // TODO: remove
import { finalValidation } from 'features/multiply/open/pipes/openMultiplyVaultValidations'
import {
  addProxyTransitions,
  applyIsProxyStage,
  applyProxyChanges,
  defaultProxyStage,
  ProxyChanges,
  ProxyStages,
  ProxyState,
} from 'features/proxy/proxy'
import { BalanceInfo, balanceInfoChange$ } from 'features/shared/balanceInfo'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { slippageChange$, UserSettingsState } from 'features/userSettings/userSettings'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { GUNI_SLIPPAGE, OAZO_LOWER_FEE } from 'helpers/multiply/calculations'
import { combineApplyChanges } from 'helpers/pipelines/combineApply'
import { combineTransitions } from 'helpers/pipelines/combineTransitions'
import { TxError } from 'helpers/types'
import { one, zero } from 'helpers/zero'
import { combineLatest, EMPTY, iif, merge, Observable, of, Subject, throwError } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  scan,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/internal/operators'
import { withLatestFrom } from 'rxjs/operators'

import { applyEnvironment, EnvironmentChange, EnvironmentState } from './enviroment'
import {
  addFormTransitions,
  applyFormChange,
  applyIsEditingStage,
  defaultFormState,
  EditingStage,
  FormChanges,
  FormFunctions,
  FormState,
} from './guniForm'
import { validateGuniErrors, validateGuniWarnings } from './guniOpenMultiplyVaultValidations'
import { applyGuniEstimateGas } from './openGuniMultiplyVaultTransactions'
import {
  applyGuniOpenVaultConditions,
  applyGuniOpenVaultStageCategorisation,
  defaultGuniOpenMultiplyVaultConditions,
  GuniOpenMultiplyVaultConditions,
} from './openGuniVaultConditions'
import curry from 'ramda/src/curry'

type InjectChange = { kind: 'injectStateOverride'; stateToOverride: Partial<OpenGuniVaultState> }

interface OverrideHelper {
  injectStateOverride: (state: Partial<any>) => void
}

function applyOpenGuniVaultInjectedOverride(state: OpenGuniVaultState, change: OpenGuniChanges) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

export type Stage = EditingStage | ProxyStages | AllowanceStages | TxStage

interface StageState {
  stage: Stage
}

interface VaultTxInfo {
  txError?: TxError
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

type ExchangeChange =
  | { kind: 'quote'; quote: Quote }
  | { kind: 'swap'; swap: Quote }
  | { kind: 'exchangeError' }

// function createInitialQuoteChange(
//   exchangeQuote$: (
//     token: string,
//     slippage: BigNumber,
//     amount: BigNumber,
//     action: ExchangeAction,
//   ) => Observable<Quote>,
//   token: string,
// ): Observable<ExchangeChange> {
//   return exchangeQuote$(token, new BigNumber(0.1), new BigNumber(1), 'BUY_COLLATERAL').pipe(
//     map((quote) => ({ kind: 'quote' as const, quote })),
//     shareReplay(1),
//   )
// }

function applyExchange<S extends ExchangeState>(state: S, change: ExchangeChange): S {
  switch (change.kind) {
    case 'quote':
      return { ...state, quote: change.quote, exchangeError: false }
    case 'swap':
      return { ...state, swap: change.swap, exchangeError: false }
    case 'exchangeError':
      return { ...state, exchangeError: true }
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
  errorMessages: VaultErrorMessage[]
}

type WarringState = {
  warningMessages: VaultWarningMessage[]
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
  TokensLpBalanceState &
  GuniOpenMultiplyVaultConditions & {
    // TODO - ADDED BY SEBASTIAN TO BE REMOVED
    maxMultiple: BigNumber
    afterOutstandingDebt: BigNumber
    multiply: BigNumber
    totalCollateral: BigNumber // it was not available in standard multiply state
    afterNetValueUSD: BigNumber
    maxDepositAmount: BigNumber
    txFees: BigNumber
    impact: BigNumber
    loanFees: BigNumber
    oazoFee: BigNumber
    gettingCollateral: BigNumber // it was not available in standard multiply state
    gettingCollateralUSD: BigNumber // it was not available in standard multiply state
    buyingCollateralUSD: BigNumber
    maxGenerateAmount: BigNumber
    totalSteps: number
    currentStep: number
    netValueUSD: BigNumber
    minToTokenAmount: BigNumber
    requiredDebt?: BigNumber
    currentPnL: BigNumber
    totalGasSpentUSD: BigNumber
    id?: BigNumber
  } & HasGasEstimation

interface GuniCalculations {
  leveragedAmount?: BigNumber
  flAmount?: BigNumber
}

function applyCalculations<S extends { ilkData: IlkData; depositAmount?: BigNumber }>(
  state: S,
): S & GuniCalculations {
  // TODO: missing fees
  const leveragedAmount = state.depositAmount
    ? state.depositAmount.div(state.ilkData.liquidationRatio.minus(one).plus(0.002))
    : zero
  const flAmount = state.depositAmount ? leveragedAmount.minus(state.depositAmount) : zero

  return {
    ...state,
    leveragedAmount,
    flAmount,
  }
}

export interface TokensLpBalanceState {
  token0Amount?: BigNumber
  token1Amount?: BigNumber
}

interface GuniTxData {
  swap?: Quote
  flAmount?: BigNumber
  leveragedAmount?: BigNumber
  token0Amount?: BigNumber
  token1Amount?: BigNumber
  amount0?: BigNumber
  amount1?: BigNumber
  fromTokenAmount?: BigNumber
  toTokenAmount?: BigNumber
  minToTokenAmount?: BigNumber
  afterCollateralAmount?: BigNumber
  afterOutstandingDebt?: BigNumber
  requiredDebt?: BigNumber
  oazoFee?: BigNumber
  totalFees?: BigNumber
  totalCollateral?: BigNumber
  gettingCollateral: BigNumber
  gettingCollateralUSD: BigNumber
  afterNetValueUSD: BigNumber
  buyingCollateralUSD: BigNumber
  multiply: BigNumber
}

type GuniTxDataChange = { kind: 'guniTxData' } & GuniTxData

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
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  onEveryBlock$: Observable<number>,
  addGasEstimation$: AddGasEstimationFunction,
  ilk: string,
  token1Balance$: (args: { token: string; leveragedAmount: BigNumber }) => Observable<BigNumber>,
  getGuniMintAmount$: (args: {
    token: string
    amountOMax: BigNumber
    amount1Max: BigNumber
  }) => Observable<{ amount0: BigNumber; amount1: BigNumber; mintAmount: BigNumber }>,
  slippageLimit$: Observable<UserSettingsState>,
): Observable<OpenGuniVaultState> {
  return ilks$.pipe(
    switchMap((ilks) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        combineLatest(context$, txHelpers$, ilkData$(ilk), slippageLimit$).pipe(
          first(),
          switchMap(([context, txHelpers, ilkData, { slippage }]) => {
            const { token, ilkDebtAvailable } = ilkData
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

                    const initialState: OpenGuniVaultState = {
                      ...defaultFormState,
                      ...defaultAllowanceState,
                      ...defaultProxyStage,
                      ...defaultGuniOpenMultiplyVaultConditions,
                      stage: 'editing',
                      priceInfo,
                      balanceInfo,
                      ilkData,
                      token,
                      account,
                      ilk,
                      proxyAddress,
                      allowance,
                      maxGenerateAmount: ilkDebtAvailable,
                      safeConfirmations: context.safeConfirmations,
                      etherscan: context.etherscan.url,
                      errorMessages: [],
                      warningMessages: [],
                      customSlippage: slippage,
                      slippage: GUNI_SLIPPAGE,
                      clear: () => change({ kind: 'clear' }),
                      gasEstimationStatus: GasEstimationStatus.unset,
                      exchangeError: false,
                      afterOutstandingDebt: zero,
                      multiply: zero,
                      totalCollateral: zero, // it was not available in standard multiply state
                      afterNetValueUSD: zero,
                      maxDepositAmount: zero,
                      txFees: zero,
                      impact: zero,
                      loanFees: zero,
                      oazoFee: zero,
                      gettingCollateral: zero, // it was not available in standard multiply state
                      gettingCollateralUSD: zero, // it was not available in standard multiply state
                      buyingCollateralUSD: zero,
                      netValueUSD: zero,
                      totalSteps: 3,
                      currentStep: 1,
                      minToTokenAmount: zero,
                      maxMultiple: one.div(ilkData.liquidationRatio.minus(one)),
                      currentPnL: zero,
                      totalGasSpentUSD: zero,
                      invalidSlippage: false,
                      injectStateOverride,
                    }

                    const stateSubject$ = new Subject<OpenGuniVaultState>()
                    const stateSubjectShared$ = stateSubject$.pipe(shareReplay(1))

                    const environmentChanges$ = merge(
                      slippageChange$(slippageLimit$),
                      priceInfoChange$(priceInfo$, token),
                      balanceInfoChange$(balanceInfo$, token, account),
                      createIlkDataChange$(ilkData$, ilk),
                    )

                    const gUniDataChanges$: Observable<GuniTxDataChange> = merge(
                      change$,
                      environmentChanges$,
                    ).pipe(
                      filter(
                        (change) =>
                          change.kind === 'depositAmount' ||
                          change.kind === 'slippage' ||
                          change.kind === 'depositMaxAmount' ||
                          change.kind === 'injectStateOverride',
                      ),
                      withLatestFrom(stateSubjectShared$),
                      switchMap(([change, state]) => {
                        const depositAmount =
                          change.kind === 'injectStateOverride'
                            ? change.stateToOverride.depositAmount
                            : change.kind === 'depositAmount'
                            ? change.depositAmount
                            : state.depositAmount

                        const { leveragedAmount, flAmount } = applyCalculations({
                          ilkData,
                          depositAmount,
                        })

                        if (!leveragedAmount || leveragedAmount.isZero()) {
                          return of(EMPTY)
                        }

                        return token1Balance$({
                          token,
                          leveragedAmount,
                        }).pipe(
                          distinctUntilChanged(compareBigNumber),
                          switchMap((daiAmountToSwapForUsdc) => {
                            const token0Amount = leveragedAmount.minus(daiAmountToSwapForUsdc)
                            const oazoFee = daiAmountToSwapForUsdc.times(OAZO_LOWER_FEE)
                            const amountWithFee = daiAmountToSwapForUsdc.plus(oazoFee)
                            const contractFee = amountWithFee.times(OAZO_LOWER_FEE)
                            const oneInchAmount = amountWithFee.minus(contractFee)

                            return exchangeQuote$(
                              tokenInfo.token1,
                              state.slippage,
                              oneInchAmount,
                              'BUY_COLLATERAL',
                              'lowerFeesExchange',
                            ).pipe(
                              switchMap((swap) => {
                                if (swap.status !== 'SUCCESS') {
                                  return of({ kind: 'exchangeError' })
                                }

                                const token1Amount = swap.collateralAmount
                                return getGuniMintAmount$({
                                  token,
                                  amountOMax: token0Amount,
                                  amount1Max: token1Amount,
                                }).pipe(
                                  map(
                                    ({ amount0, amount1, mintAmount }): GuniTxDataChange => {
                                      const requiredDebt = flAmount?.plus(oazoFee) || zero

                                      const afterNetValueUSD = mintAmount
                                        .times(priceInfo.currentCollateralPrice)
                                        .minus(requiredDebt)

                                      const multiple = mintAmount
                                        .times(priceInfo.currentCollateralPrice)
                                        .div(
                                          mintAmount
                                            .times(priceInfo.currentCollateralPrice)
                                            .minus(requiredDebt),
                                        )

                                      return {
                                        kind: 'guniTxData',
                                        swap,
                                        flAmount,
                                        leveragedAmount,
                                        token0Amount,
                                        token1Amount,
                                        amount0,
                                        amount1,
                                        fromTokenAmount: amountWithFee,
                                        toTokenAmount: swap.collateralAmount,
                                        minToTokenAmount: swap.collateralAmount.times(
                                          one.minus(state.slippage),
                                        ),
                                        buyingCollateralUSD: amount1,
                                        totalCollateral: mintAmount,
                                        afterCollateralAmount: mintAmount,
                                        afterOutstandingDebt: requiredDebt,
                                        requiredDebt,
                                        oazoFee,
                                        totalFees: oazoFee,
                                        gettingCollateral: mintAmount,
                                        gettingCollateralUSD: mintAmount.times(
                                          priceInfo.currentCollateralPrice,
                                        ),
                                        afterNetValueUSD,
                                        multiply: multiple,
                                      }
                                    },
                                  ),
                                )
                              }),
                            )
                          }),
                        )
                      }),
                    )

                    function applyGuniDataChanges<
                      S extends TokensLpBalanceState & GuniCalculations,
                      Ch extends GuniTxDataChange
                    >(state: S, change: Ch): S {
                      if (change.kind === 'guniTxData') {
                        const { kind: _, ...data } = change

                        return {
                          ...state,
                          ...data,
                        }
                      }
                      return state
                    }

                    const apply = combineApplyChanges<OpenGuniVaultState, OpenGuniChanges>(
                      applyEnvironment,
                      applyOpenGuniVaultInjectedOverride,
                      applyFormChange,
                      applyProxyChanges,
                      applyAllowanceChanges,
                      applyExchange,
                      applyGuniDataChanges,
                      applyGuniOpenVaultStageCategorisation,
                      applyGuniOpenVaultConditions,
                    )

                    const connectedProxyAddress$ = proxyAddress$(account)

                    const applyTransition = combineTransitions<OpenGuniVaultState>( // TODO: can we do it better?
                      (state) => addFormTransitions(txHelpers, change, state),
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

                    return merge(change$, environmentChanges$, gUniDataChanges$).pipe(
                      scan(apply, initialState),
                      map(applyStages),
                      map(validateGuniErrors),
                      map(validateGuniWarnings),
                      switchMap(curry(applyGuniEstimateGas)(addGasEstimation$)),
                      map(finalValidation),
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
