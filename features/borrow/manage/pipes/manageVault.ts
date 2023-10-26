import type { BigNumber } from 'bignumber.js'
import type { ProxyActionsSmartContractAdapterInterface } from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import type { VaultActionsLogicInterface } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { vaultActionsLogic } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import type { MakerVaultType } from 'blockchain/calls/vaultResolver'
import { createIlkDataChange$ } from 'blockchain/ilks'
import type { IlkData } from 'blockchain/ilks.types'
import type { Context } from 'blockchain/network.types'
import { createVaultChange$ } from 'blockchain/vaults'
import type { Vault } from 'blockchain/vaults.types'
import { createAutomationTriggersChange$ } from 'features/automation/api/automationTriggersData'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { calculateInitialTotalSteps } from 'features/borrow/open/pipes/openVaultConditions'
import { saveVaultTypeForAccount } from 'features/generalManageVault/vaultType'
import type { SaveVaultType } from 'features/generalManageVault/vaultType.types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { balanceInfoChange$ } from 'features/shared/balanceInfo'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import { priceInfoChange$ } from 'features/shared/priceInfo'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { createHistoryChange$ } from 'features/vaultHistory/vaultHistory'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import { LendingProtocol } from 'lendingProtocols'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, merge, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import type { BorrowManageAdapterInterface } from './adapters/borrowManageAdapterInterface'
import type {
  ManageStandardBorrowVaultState,
  ManageVaultChange,
  MutableManageVaultState,
} from './manageVault.types'
import { finalValidation, validateErrors, validateWarnings } from './manageVaultValidations'
import type { MainAction } from './types/MainAction.types'
import {
  applyEstimateGas,
  createProxy,
  setCollateralAllowance,
  setDaiAllowance,
} from './viewStateTransforms/manageVaultTransactions'
import { progressManage } from './viewStateTransforms/manageVaultTransitions'

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  saveVaultType$: SaveVaultType,
  proxyActions: VaultActionsLogicInterface,
  change: (ch: ManageVaultChange) => void,
  state: ManageStandardBorrowVaultState,
): ManageStandardBorrowVaultState {
  if (state.stage === 'multiplyTransitionEditing') {
    return {
      ...state,
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => change({ kind: 'progressMultiplyTransition' }),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (
    state.stage === 'multiplyTransitionWaitingForConfirmation' ||
    state.stage === 'multiplyTransitionFailure'
  ) {
    return {
      ...state,
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => {
        saveVaultTypeForAccount(
          saveVaultType$,
          state.account as string,
          state.vault.id,
          VaultType.Multiply,
          state.vault.chainId,
          LendingProtocol.Maker,
          () => {
            window.location.reload()
            change({ kind: 'multiplyTransitionSuccess' })
          },
          () => change({ kind: 'multiplyTransitionFailure' }),
          () => change({ kind: 'multiplyTransitionInProgress' }),
        )
      },
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'collateralEditing' || state.stage === 'daiEditing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) => {
        change({ kind: 'deposit', depositAmount })
      },
      updateDepositUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositUSD', depositAmountUSD }),
      updateDepositMax: () => change({ kind: 'depositMax' }),
      updateGenerate: (generateAmount?: BigNumber) => {
        change({ kind: 'generate', generateAmount })
      },
      updateGenerateMax: () => change({ kind: 'generateMax' }),
      updateWithdraw: (withdrawAmount?: BigNumber) => {
        change({ kind: 'withdraw', withdrawAmount })
      },
      updateWithdrawUSD: (withdrawAmountUSD?: BigNumber) =>
        change({ kind: 'withdrawUSD', withdrawAmountUSD }),
      updateWithdrawMax: () => change({ kind: 'withdrawMax' }),
      updatePayback: (paybackAmount?: BigNumber) => {
        change({ kind: 'payback', paybackAmount })
      },
      updatePaybackMax: () => change({ kind: 'paybackMax' }),
      toggleDepositAndGenerateOption: () =>
        change({
          kind: 'toggleDepositAndGenerateOption',
        }),
      togglePaybackAndWithdrawOption: () =>
        change({
          kind: 'togglePaybackAndWithdrawOption',
        }),
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => change({ kind: 'progressEditing' }),
      setMainAction: (mainAction: MainAction) => change({ kind: 'mainAction', mainAction }),
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
      progress: () => progressManage(txHelpers$, state, change, proxyActions),
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

export function createManageVault$<V extends Vault, VS extends ManageStandardBorrowVaultState>(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber, chainId: number) => Observable<V>,
  saveVaultType$: SaveVaultType,
  addGasEstimation$: AddGasEstimationFunction,
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  proxyActionsAdapterResolver$: ({
    makerVaultType,
  }: {
    makerVaultType: MakerVaultType
  }) => Observable<ProxyActionsSmartContractAdapterInterface>,
  vaultViewStateProvider: BorrowManageAdapterInterface<V, VS>,
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>,
  id: BigNumber,
): Observable<VS> {
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
            proxyActionsAdapterResolver$({ makerVaultType: vault.makerType }),
          ).pipe(
            first(),
            switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress, proxyActionsAdapter]) => {
              const vaultActions = vaultActionsLogic(proxyActionsAdapter)
              vault.chainId = context.chainId
              const collateralAllowance$ =
                account && proxyAddress
                  ? allowance$(vault.token, account, proxyAddress)
                  : of(undefined)
              const daiAllowance$ =
                account && proxyAddress ? allowance$('DAI', account, proxyAddress) : of(undefined)

              return combineLatest(collateralAllowance$, daiAllowance$).pipe(
                first(),
                switchMap(([collateralAllowance, daiAllowance]) => {
                  const change$ = new Subject<ManageVaultChange>()

                  function change(ch: ManageVaultChange) {
                    change$.next(ch)
                  }

                  // NOTE: Not to be used in production/dev, test only
                  function injectStateOverride(stateToOverride: Partial<MutableManageVaultState>) {
                    return change$.next({ kind: 'injectStateOverride', stateToOverride })
                  }

                  const initialTotalSteps = calculateInitialTotalSteps(
                    proxyAddress,
                    vault.token,
                    collateralAllowance,
                  )

                  const initialState = vaultViewStateProvider.createInitialViewState({
                    vault,
                    priceInfo,
                    balanceInfo,
                    ilkData,
                    account,
                    proxyAddress,
                    collateralAllowance,
                    daiAllowance,
                    context,
                    initialTotalSteps,
                    change,
                    injectStateOverride,
                  })

                  const environmentChanges$ = merge(
                    priceInfoChange$(priceInfo$, vault.token),
                    balanceInfoChange$(balanceInfo$, vault.token, account),
                    createIlkDataChange$(ilkData$, vault.ilk),
                    createVaultChange$(vault$, id, context.chainId),
                    createHistoryChange$(vaultHistory$, id),
                    createAutomationTriggersChange$(automationTriggersData$, id),
                  )

                  const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                  return merge(change$, environmentChanges$).pipe(
                    scan<ManageVaultChange, VS>(
                      vaultViewStateProvider.transformViewState,
                      initialState,
                    ),
                    map(validateErrors),
                    map(validateWarnings),
                    map(vaultViewStateProvider.addErrorsAndWarnings),
                    switchMap(curry(applyEstimateGas)(addGasEstimation$, vaultActions)),
                    map(finalValidation),
                    map(vaultViewStateProvider.addTxnCost),
                    map(
                      curry(addTransitions)(
                        txHelpers$,
                        connectedProxyAddress$,
                        saveVaultType$,
                        vaultActions,
                        change,
                      ),
                    ),
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
