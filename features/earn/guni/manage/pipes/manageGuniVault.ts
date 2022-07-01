import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { createVaultChange$, Vault } from 'blockchain/vaults'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { calculateInitialTotalSteps } from 'features/borrow/open/pipes/openVaultConditions'
import { MakerOracleTokenPrice } from 'features/earn/makerOracleTokenPrices'
import { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { createHistoryChange$, VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { GasEstimationStatus } from 'helpers/form'
import { curry } from 'lodash'
import moment, { Moment } from 'moment'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators'

import { getToken } from '../../../../../blockchain/tokensMetadata'
import { one, zero } from '../../../../../helpers/zero'
import { applyExchange } from '../../../../multiply/manage/pipes/manageMultiplyQuote'
import {
  ManageMultiplyVaultChange,
  ManageMultiplyVaultState,
  MutableManageMultiplyVaultState,
} from '../../../../multiply/manage/pipes/manageMultiplyVault'
import {
  applyManageVaultCalculations,
  defaultManageMultiplyVaultCalculations,
} from '../../../../multiply/manage/pipes/manageMultiplyVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
  defaultManageMultiplyVaultConditions,
} from '../../../../multiply/manage/pipes/manageMultiplyVaultConditions'
import { applyManageVaultEnvironment } from '../../../../multiply/manage/pipes/manageMultiplyVaultEnvironment'
import { manageMultiplyInputsDefaults } from '../../../../multiply/manage/pipes/manageMultiplyVaultForm'
import {
  applyManageVaultSummary,
  defaultManageVaultSummary,
} from '../../../../multiply/manage/pipes/manageMultiplyVaultSummary'
import { applyManageVaultTransaction } from '../../../../multiply/manage/pipes/manageMultiplyVaultTransactions'
import { applyManageVaultTransition } from '../../../../multiply/manage/pipes/manageMultiplyVaultTransitions'
import {
  finalValidation,
  validateErrors,
  validateWarnings,
} from '../../../../multiply/manage/pipes/manageMultiplyVaultValidations'
import { BalanceInfo, balanceInfoChange$ } from '../../../../shared/balanceInfo'
import { closeGuniVault } from './guniActionsCalls'
import { applyGuniCalculations } from './manageGuniVaultCalculations'
import { applyGuniManageVaultConditions } from './manageGuniVaultConditions'
import { applyGuniManageEstimateGas } from './manageGuniVaultTransactions'

function applyManageVaultInjectedOverride(
  change: ManageMultiplyVaultChange,
  state: ManageEarnVaultState,
) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

export type GuniTxData = {
  sharedAmount0?: BigNumber
  sharedAmount1?: BigNumber
  minToTokenAmount?: BigNumber
  toTokenAmount?: BigNumber
  fromTokenAmount?: BigNumber
  requiredDebt?: BigNumber
}

type GuniTxDataChange = { kind: 'guniTxData' }

function applyGuniDataChanges<S, Ch extends GuniTxDataChange>(change: Ch, state: S): S {
  if (change.kind === 'guniTxData') {
    const { kind: _, ...data } = change

    return {
      ...state,
      ...data,
    }
  }
  return state
}

export function applyManageGuniVaultTransition(
  change: ManageMultiplyVaultChange,
  state: ManageEarnVaultState,
): ManageEarnVaultState {
  if (change.kind === 'clear') {
    return {
      ...state,
      ...defaultMutableManageMultiplyVaultState,
      ...defaultManageMultiplyVaultCalculations,
      ...defaultManageMultiplyVaultConditions,
      ...manageMultiplyInputsDefaults,
    }
  }

  return state
}

function apply(
  state: ManageEarnVaultState,
  change: ManageMultiplyVaultChange | GuniTxDataChange,
): ManageEarnVaultState {
  const s1 = applyExchange(change as ManageMultiplyVaultChange, state)
  const s2 = applyManageVaultTransition(change as ManageMultiplyVaultChange, s1)
  const s3 = applyManageGuniVaultTransition(change as ManageMultiplyVaultChange, s2)
  const s4 = applyManageVaultTransaction(change as ManageMultiplyVaultChange, s3)
  const s5 = applyManageVaultEnvironment(change as ManageMultiplyVaultChange, s4)
  const s6 = applyManageVaultInjectedOverride(change as ManageMultiplyVaultChange, s5)
  const s7 = applyGuniDataChanges(change as GuniTxDataChange, s6)
  const s8 = applyManageVaultCalculations(s7)
  const s9 = applyGuniCalculations(s8)
  const s10 = applyManageVaultStageCategorisation(s9)
  const s11 = applyManageVaultConditions(s10)
  const s12 = applyGuniManageVaultConditions(s11)
  return applyManageVaultSummary(s12)
}

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  context: Context,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: ManageMultiplyVaultChange) => void,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  if (state.stage === 'adjustPosition' || state.stage === 'otherActions') {
    return {
      ...state,
      progress: () => change({ kind: 'progressEditing' }),
      setCloseVaultTo: () =>
        change({
          kind: 'toggleEditing',
          stage: state.stage === 'adjustPosition' ? 'otherActions' : 'adjustPosition',
        }),
    }
  }

  if (state.stage === 'manageWaitingForConfirmation' || state.stage === 'manageFailure') {
    return {
      ...state,
      progress: () => closeGuniVault(txHelpers$, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'manageSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'resetToEditing' }),
    }
  }

  return state
}

export const defaultMutableManageMultiplyVaultState = {
  stage: 'adjustPosition',
  originalEditingStage: 'adjustPosition',
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
  selectedCollateralAllowanceRadio: 'unlimited',
  selectedDaiAllowanceRadio: 'unlimited',
  showSliderController: true,
  closeVaultTo: 'dai',
  mainAction: 'buy',
  otherAction: 'closeVault',
} as MutableManageMultiplyVaultState

export type ManageEarnVaultState = ManageMultiplyVaultState & {
  totalValueLocked?: BigNumber
  earningsToDate?: BigNumber
  earningsToDateAfterFees?: BigNumber
  netAPY?: BigNumber
  makerOracleTokenPrices: {
    today: MakerOracleTokenPrice
    sevenDaysAgo: MakerOracleTokenPrice
  }
}

export function createManageGuniVault$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  addGasEstimation$: AddGasEstimationFunction,
  getProportions$: (
    gUniAmount: BigNumber,
    token: string,
  ) => Observable<{ sharedAmount0: BigNumber; sharedAmount1: BigNumber }>,
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  historicalTokenPrices$: (token: string, timestamp: Moment) => Observable<MakerOracleTokenPrice>,
  id: BigNumber,
): Observable<ManageEarnVaultState> {
  return context$.pipe(
    switchMap((context) => {
      const account = context.status === 'connected' ? context.account : undefined
      return vault$(id, context.chainId).pipe(
        first(),
        switchMap((vault) => {
          return combineLatest(
            priceInfo$(vault.token),
            balanceInfo$(vault.token, account),
            ilkData$(vault.ilk),
            account ? proxyAddress$(account) : of(undefined),
            historicalTokenPrices$(vault.token, moment()),
            historicalTokenPrices$(vault.token, moment().subtract(7, 'd')),
          ).pipe(
            first(),
            switchMap(
              ([
                priceInfo,
                balanceInfo,
                ilkData,
                proxyAddress,
                tokenPriceToday,
                tokenPriceSevenDaysAgo,
              ]) => {
                const collateralAllowance$ =
                  account && proxyAddress
                    ? allowance$(vault.token, account, proxyAddress)
                    : of(undefined)
                const daiAllowance$ =
                  account && proxyAddress ? allowance$('DAI', account, proxyAddress) : of(undefined)

                return combineLatest(collateralAllowance$, daiAllowance$).pipe(
                  first(),
                  switchMap(([collateralAllowance, daiAllowance]) => {
                    const change$ = new Subject<ManageMultiplyVaultChange>()

                    function change(ch: ManageMultiplyVaultChange) {
                      change$.next(ch)
                    }

                    // NOTE: Not to be used in production/dev, test only
                    function injectStateOverride(
                      stateToOverride: Partial<MutableManageMultiplyVaultState>,
                    ) {
                      return change$.next({ kind: 'injectStateOverride', stateToOverride })
                    }

                    const initialTotalSteps = calculateInitialTotalSteps(
                      proxyAddress,
                      vault.token,
                      'skip',
                    )

                    const initialState: ManageEarnVaultState & GuniTxData = {
                      ...defaultMutableManageMultiplyVaultState,
                      ...defaultManageMultiplyVaultCalculations,
                      ...defaultManageMultiplyVaultConditions,
                      vault,
                      priceInfo,
                      balanceInfo,
                      ilkData,
                      account,
                      proxyAddress,
                      collateralAllowance,
                      daiAllowance,
                      safeConfirmations: context.safeConfirmations,
                      etherscan: context.etherscan.url,
                      errorMessages: [],
                      warningMessages: [],
                      summary: defaultManageVaultSummary,
                      slippage: zero,
                      exchangeError: false,
                      initialTotalSteps,
                      totalSteps: initialTotalSteps,
                      currentStep: 1,
                      vaultHistory: [],
                      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
                      clear: () => change({ kind: 'clear' }),
                      gasEstimationStatus: GasEstimationStatus.unset,
                      invalidSlippage: false,
                      injectStateOverride,
                      makerOracleTokenPrices: {
                        today: tokenPriceToday,
                        sevenDaysAgo: tokenPriceSevenDaysAgo,
                      },
                    }

                    const stateSubject$ = new Subject<ManageMultiplyVaultState>()
                    const stateSubjectShared$ = stateSubject$.pipe(shareReplay(1))

                    const environmentChanges$ = merge(
                      priceInfoChange$(priceInfo$, vault.token),
                      balanceInfoChange$(balanceInfo$, vault.token, account),
                      createIlkDataChange$(ilkData$, vault.ilk),
                      createVaultChange$(vault$, id, context.chainId),
                      createHistoryChange$(vaultHistory$, id),
                    )

                    const guniDataChange$ = environmentChanges$.pipe(
                      withLatestFrom(stateSubjectShared$),
                      switchMap(([_, state]) => {
                        return getProportions$(vault.lockedCollateral, vault.token).pipe(
                          switchMap(({ sharedAmount0, sharedAmount1 }) => {
                            const requiredDebt = vault.debt
                            const { token1 } = getToken(vault.token) // USDC

                            return exchangeQuote$(
                              token1!,
                              state.slippage,
                              sharedAmount1.minus(0.01),
                              'SELL_COLLATERAL',
                              'noFeesExchange',
                            ).pipe(
                              map((swap) => {
                                if (swap.status !== 'SUCCESS') {
                                  return of({ kind: 'exchangeError' })
                                }

                                return {
                                  kind: 'guniTxData',
                                  swap,
                                  sharedAmount0,
                                  sharedAmount1: sharedAmount1.minus(0.01),
                                  requiredDebt,
                                  fromTokenAmount: swap.collateralAmount,
                                  toTokenAmount: swap.daiAmount,
                                  minToTokenAmount: swap.daiAmount.times(one.minus(state.slippage)),
                                }
                              }),
                            )
                          }),
                        )
                      }),
                    )

                    const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                    return merge(change$, environmentChanges$, guniDataChange$).pipe(
                      scan(apply, initialState),
                      map(validateErrors),
                      map(validateWarnings),
                      switchMap(curry(applyGuniManageEstimateGas)(addGasEstimation$)),
                      map(finalValidation),
                      map(
                        curry(addTransitions)(txHelpers$, context, connectedProxyAddress$, change),
                      ),
                      tap((state) => stateSubject$.next(state)),
                    )
                  }),
                )
              },
            ),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
