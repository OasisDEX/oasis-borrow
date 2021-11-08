import { BigNumber } from 'bignumber.js'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
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
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { TxStage } from 'features/openMultiplyVault/openMultiplyVault'
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
import { GasEstimationStatus } from 'helpers/form'
import { combineLatest, iif, merge, Observable, of, Subject, throwError } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap } from 'rxjs/internal/operators'

import { combineApplyChanges } from '../../helpers/pipelines/combineApply'
import { combineTransitions } from '../../helpers/pipelines/combineTransitions'
import {
  VaultErrorMessage,
  VaultWarningMessage,
} from '../openMultiplyVault/openMultiplyVaultValidations' // TODO: remove
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
  // ExchangeState &
  VaultTxInfo &
  ErrorState &
  WarringState &
  ProxyState & {
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
  }

const apply = combineApplyChanges<OpenGuniVaultState, OpenGuniChanges>(
  applyEnvironment,
  applyFormChange,
  applyProxyChanges,
  applyAllowanceChanges,
)
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
                      //   summary: defaultOpenVaultSummary,
                      // slippage: SLIPPAGE,
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
                      slippage: new BigNumber(1000),
                      isExchangeLoading: false,
                      gettingCollateral: new BigNumber(1000), // it was not available in standard multiply state
                      gettingCollateralUSD: new BigNumber(1000), // it was not available in standard multiply state
                      buyingCollateralUSD: new BigNumber(1000),
                      maxGenerateAmount: new BigNumber(1000),
                      totalSteps: 3,
                      currentStep: 1,
                      canRegress: true,
                      canProgress: true,
                      isLoadingStage: false,
                      insufficientAllowance: true,
                      customAllowanceAmountEmpty: false,
                      inputAmountsEmpty: false,
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

                    const applyTransition = combineTransitions<OpenGuniVaultState>( // TODO: can we do it better?
                      (state) => addFormTransitions(change, state),
                      (state) =>
                        addProxyTransitions(txHelpers, connectedProxyAddress$, change, state),
                      (state) =>
                        allowanceTransitions(
                          txHelpers,
                          change,
                          { tokenToAllow: tokenInfo.token1 },
                          state,
                        ),
                    )

                    const applyStages = combineTransitions<OpenGuniVaultState>(
                      applyIsEditingStage,
                      applyIsProxyStage,
                      applyIsAllowanceStage,
                      applyAllowanceConditions,
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
