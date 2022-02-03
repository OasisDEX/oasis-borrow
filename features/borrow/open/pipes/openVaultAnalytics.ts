import { INPUT_DEBOUNCE_TIME, Tracker } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { Context } from 'blockchain/network'
import { AccountDetails } from 'features/account/AccountData'
import { zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import { combineLatest, merge, Observable, zip } from 'rxjs'
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators'

import { MutableOpenVaultState, OpenVaultState } from './openVault'

type GenerateAmountChange = {
  kind: 'generateAmountChange'
  value: BigNumber
}

type DepositAmountChange = {
  kind: 'depositAmountChange'
  value: BigNumber
}

type AllowanceChange = {
  kind: 'allowanceChange'
  value: {
    type: Pick<MutableOpenVaultState, 'selectedAllowanceRadio'>
    amount: BigNumber
  }
}

type OpenVaultConfirm = {
  kind: 'openVaultConfirm'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
  }
}

type OpenVaultConfirmTransaction = {
  kind: 'openVaultConfirmTransaction'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
    txHash: string
  }
}

export function createOpenVaultAnalytics$(
  accountDetails$: Observable<AccountDetails>,
  openVaultState$: Observable<OpenVaultState>,
  context$: Observable<Context>,
  tracker: Tracker,
) {
  const firstCDPChange: Observable<boolean | undefined> = accountDetails$.pipe(
    map(({ numberOfVaults }) => (numberOfVaults ? numberOfVaults === 0 : undefined)),
    distinctUntilChanged(isEqual),
  )

  const depositAmountChanges: Observable<DepositAmountChange> = openVaultState$.pipe(
    filter((state) => state.stage === 'editing'),
    map((state) => state.depositAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
    map((amount) => ({
      kind: 'depositAmountChange',
      value: amount,
    })),
  )

  const generateAmountChanges: Observable<GenerateAmountChange> = openVaultState$.pipe(
    filter((state) => state.stage === 'editing'),
    map((state) => state.generateAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
    map((amount) => ({
      kind: 'generateAmountChange',
      value: amount,
    })),
  )

  const allowanceTypeChanges: Observable<Pick<
    MutableOpenVaultState,
    'selectedAllowanceRadio'
  >> = openVaultState$.pipe(
    filter((state) => state.stage === 'allowanceWaitingForConfirmation'),
    map((state) => state.selectedAllowanceRadio),
    distinctUntilChanged(isEqual),
  )

  const allowanceAmountChanges: Observable<BigNumber> = openVaultState$.pipe(
    map((state) => state.allowanceAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
  )

  const allowanceChanges: Observable<AllowanceChange> = zip(
    allowanceTypeChanges,
    allowanceAmountChanges,
  ).pipe(
    map(([type, amount]) => ({
      kind: 'allowanceChange',
      value: {
        type,
        amount,
      },
    })),
  )

  const openVaultConfirm: Observable<OpenVaultConfirm> = openVaultState$.pipe(
    filter((state) => state.stage === 'txWaitingForApproval'),
    map(({ ilk, depositAmount, generateAmount }) => ({
      kind: 'openVaultConfirm',
      value: {
        ilk: ilk,
        collateralAmount: depositAmount,
        daiAmount: generateAmount || zero,
      },
    })),
    distinctUntilChanged(isEqual),
  )

  const openVaultConfirmTransaction: Observable<OpenVaultConfirmTransaction> = openVaultState$.pipe(
    filter((state) => state.stage === 'txInProgress'),
    map(({ ilk, depositAmount, generateAmount, openTxHash }) => ({
      kind: 'openVaultConfirmTransaction',
      value: {
        ilk: ilk,
        collateralAmount: depositAmount,
        daiAmount: generateAmount || zero,
        txHash: openTxHash,
      },
    })),
    distinctUntilChanged(isEqual),
  )

  return combineLatest(context$, firstCDPChange).pipe(
    switchMap(([context, firstCDP]) =>
      merge(
        depositAmountChanges,
        generateAmountChanges,
        allowanceChanges,
        openVaultConfirm,
        openVaultConfirmTransaction,
      ).pipe(
        tap((event) => {
          switch (event.kind) {
            case 'depositAmountChange':
              tracker.createVaultDeposit(firstCDP, event.value.toString())
              break
            case 'generateAmountChange':
              tracker.createVaultGenerate(firstCDP, event.value.toString())
              break
            case 'allowanceChange':
              tracker.pickAllowance(
                firstCDP,
                event.value.type.toString(),
                event.value.amount.toString(),
              )
              break
            case 'openVaultConfirm':
              tracker.confirmVaultConfirm(
                event.value.ilk,
                event.value.collateralAmount.toString(),
                event.value.daiAmount.toString(),
                firstCDP,
              )
              break
            case 'openVaultConfirmTransaction':
              const network = networksById[context.chainId].name
              const walletType = context.connectionKind

              tracker.confirmVaultConfirmTransaction(
                event.value.ilk,
                event.value.collateralAmount.toString(),
                event.value.daiAmount.toString(),
                firstCDP,
                event.value.txHash,
                network,
                walletType,
              )
              break
            default:
              throw new Error('Unhandled Scenario')
          }
        }),
      ),
    ),
  )
}
