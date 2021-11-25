import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { createVaultChange$, Vault } from 'blockchain/vaults'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { calculateInitialTotalSteps } from 'features/openVault/openVaultConditions'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { GasEstimationStatus } from 'helpers/form'
import { SLIPPAGE } from 'helpers/multiply/calculations'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap } from 'rxjs/operators'

import {
  applyExchange,
  // createExchangeChange$,
  // createInitialQuoteChange,
} from '../manageMultiplyVault/manageMultiplyQuote'
import {
  CloseVaultTo,
  ManageMultiplyVaultChange,
  ManageMultiplyVaultState,
  MutableManageMultiplyVaultState,
} from '../manageMultiplyVault/manageMultiplyVault'
import {
  applyManageVaultCalculations,
  defaultManageMultiplyVaultCalculations,
} from '../manageMultiplyVault/manageMultiplyVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
  defaultManageMultiplyVaultConditions,
} from '../manageMultiplyVault/manageMultiplyVaultConditions'
import { applyManageVaultEnvironment } from '../manageMultiplyVault/manageMultiplyVaultEnvironment'
import {
  applyManageVaultSummary,
  defaultManageVaultSummary,
} from '../manageMultiplyVault/manageMultiplyVaultSummary'
import {
  applyEstimateGas,
  applyManageVaultTransaction,
} from '../manageMultiplyVault/manageMultiplyVaultTransactions'
import { progressAdjust } from '../manageMultiplyVault/manageMultiplyVaultTransitions'
import {
  validateErrors,
  validateWarnings,
} from '../manageMultiplyVault/manageMultiplyVaultValidations'
import { BalanceInfo, balanceInfoChange$ } from '../shared/balanceInfo'
import { getToken } from '../../blockchain/tokensMetadata'

function applyManageVaultInjectedOverride(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

function apply(state: ManageMultiplyVaultState, change: ManageMultiplyVaultChange) {
  const s1_ = applyExchange(change, state)
  const s5 = applyManageVaultTransaction(change, s1_)
  const s6 = applyManageVaultEnvironment(change, s5)
  const s7 = applyManageVaultInjectedOverride(change, s6)
  const s8 = applyManageVaultCalculations(s7) // TODO probably we need guni specific calculations
  const s9 = applyManageVaultStageCategorisation(s8)
  const s10 = applyManageVaultConditions(s9)
  return applyManageVaultSummary(s10)
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
      setCloseVaultTo: (closeVaultTo: CloseVaultTo) =>
        change({ kind: 'closeVaultTo', closeVaultTo }),
      progress: () => change({ kind: 'progressEditing' }),
    }
  }

  if (state.stage === 'manageWaitingForConfirmation' || state.stage === 'manageFailure') {
    return {
      ...state,
      progress: () => progressAdjust(txHelpers$, context, state, change),
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
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
  selectedCollateralAllowanceRadio: 'unlimited',
  selectedDaiAllowanceRadio: 'unlimited',
  showSliderController: true,
  closeVaultTo: 'dai',
  mainAction: 'buy',
  otherAction: 'closeVault',
} as MutableManageMultiplyVaultState

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
  ) => Observable<Quote>,
  addGasEstimation$: AddGasEstimationFunction,
  getProportions$: (
    gUniAmount: BigNumber,
    token: string,
  ) => Observable<{ shareAmount0: BigNumber; shareAmount1: BigNumber }>,
  id: BigNumber,
): Observable<ManageMultiplyVaultState> {
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
          ).pipe(
            first(),
            switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress]) => {
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

                  const initialState: ManageMultiplyVaultState = {
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
                    slippage: SLIPPAGE,
                    exchangeError: false,
                    initialTotalSteps,
                    totalSteps: initialTotalSteps,
                    currentStep: 1,
                    clear: () => change({ kind: 'clear' }),
                    gasEstimationStatus: GasEstimationStatus.unset,
                    injectStateOverride,
                  }

                  const guniDataChange$ = getProportions$(vault.lockedCollateral, vault.token).pipe(
                    switchMap(({ shareAmount0, shareAmount1 }) => {
                      // TODO calculations required here
                      console.log(shareAmount0.toNumber())
                      console.log(shareAmount1.toNumber())
                      const { token1 } = getToken(vault.token) // USDC

                      return exchangeQuote$(
                        token1!,
                        SLIPPAGE,
                        shareAmount1, // TODO dunno what to put here
                        'SELL_COLLATERAL',
                      ).pipe(
                        map((swap) => {
                          console.log('lets go')
                          if (swap.status !== 'SUCCESS') {
                            return of({ kind: 'exchangeError' })
                          }

                          return {
                            kind: 'guniTxData',
                            swap,

                            // fill all necessary parametrs here
                          }
                        }),
                      )
                    }),
                  )

                  const stateSubject$ = new Subject<ManageMultiplyVaultState>()
                  console.log('manageGuni')
                  const environmentChanges$ = merge(
                    priceInfoChange$(priceInfo$, vault.token),
                    balanceInfoChange$(balanceInfo$, vault.token, account),
                    createIlkDataChange$(ilkData$, vault.ilk),
                    createVaultChange$(vault$, id, context.chainId),
                    // guniDataChange$,
                    // createInitialQuoteChange(exchangeQuote$, vault.token),
                    // createExchangeChange$(exchangeQuote$, stateSubject$),
                  )

                  const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                  return merge(change$, environmentChanges$).pipe(
                    scan(apply, initialState),
                    map(validateErrors),
                    map(validateWarnings),
                    switchMap(curry(applyEstimateGas)(addGasEstimation$)),
                    map(curry(addTransitions)(txHelpers$, context, connectedProxyAddress$, change)),
                    tap((state) => stateSubject$.next(state)),
                  )
                }),
              )
            }),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
