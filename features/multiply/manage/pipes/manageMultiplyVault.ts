import type { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { createIlkDataChange$ } from 'blockchain/ilks'
import type { IlkData } from 'blockchain/ilks.types'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { createVaultChange$ } from 'blockchain/vaults'
import type { Vault } from 'blockchain/vaults.types'
import { createAutomationTriggersChange$ } from 'features/automation/api/automationTriggersData'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { calculateInitialTotalSteps } from 'features/borrow/open/pipes/openVaultConditions'
import type { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { saveVaultTypeForAccount } from 'features/generalManageVault/vaultType'
import type { SaveVaultType } from 'features/generalManageVault/vaultType.types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { balanceInfoChange$ } from 'features/shared/balanceInfo'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import { priceInfoChange$ } from 'features/shared/priceInfo'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { slippageChange$ } from 'features/userSettings/userSettings'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { createHistoryChange$ } from 'features/vaultHistory/vaultHistory'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { LendingProtocol } from 'lendingProtocols'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, merge, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap } from 'rxjs/operators'

import type { CloseVaultTo } from './CloseVaultTo.types'
import type { MainAction } from './MainAction.types'
import { applyExchange, createExchangeChange$, createInitialQuoteChange } from './manageMultiplyQuote'
import { defaultMutableManageMultiplyVaultState } from './manageMultiplyVault.constants'
import { applyManageVaultAllowance } from './manageMultiplyVaultAllowances'
import { applyManageVaultCalculations } from './manageMultiplyVaultCalculations'
import { defaultManageMultiplyVaultCalculations } from './manageMultiplyVaultCalculations.constants'
import type { ManageMultiplyVaultChange } from './ManageMultiplyVaultChange.types'
import { applyManageVaultConditions, applyManageVaultStageCategorisation } from './manageMultiplyVaultConditions'
import { defaultManageMultiplyVaultConditions } from './manageMultiplyVaultConditions.constants'
import { applyManageVaultEnvironment } from './manageMultiplyVaultEnvironment'
import { applyManageVaultForm } from './manageMultiplyVaultForm'
import { applyManageVaultInput } from './manageMultiplyVaultInput'
import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'
import { applyManageVaultSummary } from './manageMultiplyVaultSummary'
import { defaultManageVaultSummary } from './manageMultiplyVaultSummary.constants'
import {
  applyEstimateGas,
  applyManageVaultTransaction,
  createProxy,
  setCollateralAllowance,
  setDaiAllowance,
} from './manageMultiplyVaultTransactions'
import { applyManageVaultTransition, progressAdjust } from './manageMultiplyVaultTransitions'
import { finalValidation, validateErrors, validateWarnings } from './manageMultiplyVaultValidations'
import type { MutableManageMultiplyVaultState } from './MutableManageMultiplyVaultState.types'
import type { OtherAction } from './OtherAction.types'

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
  const s1 = applyManageVaultInput(change, state)
  const s1_ = applyExchange(change, s1)
  const s2 = applyManageVaultForm(change, s1_)
  const s3 = applyManageVaultAllowance(change, s2)
  const s4 = applyManageVaultTransition(change, s3)
  const s5 = applyManageVaultTransaction(change, s4)
  const s6 = applyManageVaultEnvironment(change, s5)
  const s7 = applyManageVaultInjectedOverride(change, s6)
  const s8 = applyManageVaultCalculations(s7)
  const s9 = applyManageVaultStageCategorisation(s8)
  const s10 = applyManageVaultConditions(s9)
  return applyManageVaultSummary(s10)
}

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  context: Context,
  proxyAddress$: Observable<string | undefined>,
  saveVaultType$: SaveVaultType,
  change: (ch: ManageMultiplyVaultChange) => void,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  if (state.stage === 'borrowTransitionEditing') {
    return {
      ...state,
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => change({ kind: 'progressBorrowTransition' }),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (
    state.stage === 'borrowTransitionWaitingForConfirmation' ||
    state.stage === 'borrowTransitionFailure'
  ) {
    return {
      ...state,
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => {
        saveVaultTypeForAccount(
          saveVaultType$,
          state.account as string,
          state.vault.id,
          state.vaultType === VaultType.Borrow ? VaultType.Multiply : VaultType.Borrow,
          state.vault.chainId,
          LendingProtocol.Maker,
          () => {
            window.location.reload()
            change({ kind: 'borrowTransitionSuccess' })
          },
          () => change({ kind: 'borrowTransitionFailure' }),
          () => change({ kind: 'borrowTransitionInProgress' }),
        )
      },
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'adjustPosition' || state.stage === 'otherActions') {
    return {
      ...state,
      updateDepositAmount: (depositAmount?: BigNumber) => {
        change({ kind: 'depositAmount', depositAmount })
      },
      updateDepositAmountUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositAmountUSD', depositAmountUSD }),
      updateDepositAmountMax: () => change({ kind: 'depositAmountMax' }),

      updatePaybackAmount: (paybackAmount?: BigNumber) => {
        change({ kind: 'paybackAmount', paybackAmount })
      },
      updatePaybackAmountMax: () => change({ kind: 'paybackAmountMax' }),

      updateDepositDaiAmount: (depositDaiAmount?: BigNumber) => {
        change({ kind: 'depositDaiAmount', depositDaiAmount })
      },
      updateDepositDaiAmountMax: () => change({ kind: 'depositDaiAmountMax' }),
      updateWithdrawAmount: (withdrawAmount?: BigNumber) => {
        change({ kind: 'withdrawAmount', withdrawAmount })
      },
      updateWithdrawAmountUSD: (withdrawAmountUSD?: BigNumber) =>
        change({ kind: 'withdrawAmountUSD', withdrawAmountUSD }),
      updateWithdrawAmountMax: () => change({ kind: 'withdrawAmountMax' }),

      updateGenerateAmount: (generateAmount?: BigNumber) => {
        change({ kind: 'generateAmount', generateAmount })
      },
      updateGenerateAmountMax: () => change({ kind: 'generateAmountMax' }),

      setCloseVaultTo: (closeVaultTo: CloseVaultTo) =>
        change({ kind: 'closeVaultTo', closeVaultTo }),

      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => change({ kind: 'progressEditing' }),
      toggleSliderController: () => change({ kind: 'toggleSliderController' }),
      updateRequiredCollRatio: (requiredCollRatio: BigNumber) =>
        change({ kind: 'requiredCollRatio', requiredCollRatio }),
      setMainAction: (mainAction: MainAction) => change({ kind: 'mainAction', mainAction }),
      updateBuy: (buyAmount?: BigNumber) => change({ kind: 'buyAmount', buyAmount }),
      updateBuyUSD: (buyAmountUSD?: BigNumber) => change({ kind: 'buyAmountUSD', buyAmountUSD }),
      updateBuyMax: () => change({ kind: 'buyMax' }),
      updateSell: (sellAmount?: BigNumber) => change({ kind: 'sellAmount', sellAmount }),
      updateSellUSD: (sellAmountUSD?: BigNumber) =>
        change({ kind: 'sellAmountUSD', sellAmountUSD }),
      updateSellMax: () => change({ kind: 'sellMax' }),
      setOtherAction: (otherAction: OtherAction) => change({ kind: 'otherAction', otherAction }),
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers$, proxyAddress$, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'progressProxy' }),
    }
  }

  if (
    state.stage === 'collateralAllowanceWaitingForConfirmation' ||
    state.stage === 'collateralAllowanceFailure'
  ) {
    return {
      ...state,
      updateCollateralAllowanceAmount: (collateralAllowanceAmount?: BigNumber) =>
        change({
          kind: 'collateralAllowance',
          collateralAllowanceAmount,
        }),
      setCollateralAllowanceAmountUnlimited: () => change({ kind: 'collateralAllowanceUnlimited' }),
      setCollateralAllowanceAmountToDepositAmount: () =>
        change({
          kind: 'collateralAllowanceAsDepositAmount',
        }),
      resetCollateralAllowanceAmount: () =>
        change({
          kind: 'collateralAllowanceReset',
        }),
      progress: () => setCollateralAllowance(txHelpers$, change, state),
      regress: () => change({ kind: 'regressCollateralAllowance' }),
    }
  }

  if (state.stage === 'collateralAllowanceSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'progressCollateralAllowance' }),
    }
  }

  if (
    state.stage === 'daiAllowanceWaitingForConfirmation' ||
    state.stage === 'daiAllowanceFailure'
  ) {
    return {
      ...state,
      updateDaiAllowanceAmount: (daiAllowanceAmount?: BigNumber) =>
        change({ kind: 'daiAllowance', daiAllowanceAmount }),
      setDaiAllowanceAmountUnlimited: () => change({ kind: 'daiAllowanceUnlimited' }),
      setDaiAllowanceAmountToPaybackAmount: () => change({ kind: 'daiAllowanceAsPaybackAmount' }),
      setDaiAllowanceAmountToDepositDaiAmount: () =>
        change({ kind: 'daiAllowanceAsDepositDaiAmount' }),
      resetDaiAllowanceAmount: () =>
        change({
          kind: 'daiAllowanceReset',
        }),
      progress: () => setDaiAllowance(txHelpers$, change, state),
      regress: () => change({ kind: 'regressDaiAllowance' }),
    }
  }

  if (state.stage === 'daiAllowanceSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'backToEditing' }),
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

export function createManageMultiplyVault$(
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
  slippageLimit$: Observable<UserSettingsState>,
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  saveVaultType$: SaveVaultType,
  automationTriggersData$: (id: BigNumber, networkId: NetworkIds) => Observable<TriggersData>,
  vaultType: VaultType,
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
            slippageLimit$,
          ).pipe(
            first(),
            switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress, { slippage }]) => {
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
                    ...defaultMutableManageMultiplyVaultState(vaultType, vault.lockedCollateral),
                    ...defaultManageMultiplyVaultCalculations,
                    ...defaultManageMultiplyVaultConditions,
                    vaultType,
                    vault,
                    priceInfo,
                    vaultHistory: [],
                    stopLossData: undefined,
                    autoBuyData: undefined,
                    autoSellData: undefined,
                    constantMultipleData: undefined,
                    balanceInfo,
                    ilkData,
                    account,
                    proxyAddress,
                    collateralAllowance,
                    daiAllowance,
                    safeConfirmations: getNetworkContracts(NetworkIds.MAINNET, context.chainId)
                      .safeConfirmations,
                    etherscan: getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan
                      .url,
                    errorMessages: [],
                    warningMessages: [],
                    summary: defaultManageVaultSummary,
                    slippage,
                    exchangeError: false,
                    initialTotalSteps,
                    totalSteps: initialTotalSteps,
                    currentStep: 1,
                    toggle: (stage) => change({ kind: 'toggleEditing', stage }),
                    setOtherAction: (otherAction: OtherAction) =>
                      change({ kind: 'otherAction', otherAction }),
                    clear: () => change({ kind: 'clear' }),
                    gasEstimationStatus: GasEstimationStatus.unset,
                    injectStateOverride,
                  }

                  const stateSubject$ = new Subject<ManageMultiplyVaultState>()

                  const environmentChanges$ = merge(
                    priceInfoChange$(priceInfo$, vault.token),
                    balanceInfoChange$(balanceInfo$, vault.token, account),
                    createIlkDataChange$(ilkData$, vault.ilk),
                    createVaultChange$(vault$, id, context.chainId),
                    createInitialQuoteChange(exchangeQuote$, vault.token, slippage),
                    createExchangeChange$(exchangeQuote$, stateSubject$),
                    slippageChange$(slippageLimit$),
                    createHistoryChange$(vaultHistory$, id),
                    createAutomationTriggersChange$(automationTriggersData$, id, NetworkIds.MAINNET),
                  )

                  const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                  return merge(change$, environmentChanges$).pipe(
                    scan(apply, initialState),
                    map(validateErrors),
                    map(validateWarnings),
                    switchMap(curry(applyEstimateGas)(context, addGasEstimation$)),
                    map(finalValidation),
                    map((state) =>
                      addTransitions(
                        txHelpers$,
                        context,
                        connectedProxyAddress$,
                        saveVaultType$,
                        change,
                        state,
                      ),
                    ),
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
