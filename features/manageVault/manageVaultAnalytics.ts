import { INPUT_DEBOUNCE_TIME, Pages, Tracker } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { isEqual } from 'lodash'
import { merge, Observable, zip } from 'rxjs'
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators'

import { ManageVaultState } from './manageVault'

type GenerateAmountChange = {
  kind: 'generateAmountChange'
  value: BigNumber
}

type DepositAmountChange = {
  kind: 'depositAmountChange'
  value: BigNumber
}

type PaybackAmountChange = {
  kind: 'paybackAmountChange'
  value: BigNumber
}

type WithdrawAmountChange = {
  kind: 'withdrawAmountChange'
  value: BigNumber
}

type AllowanceChange = {
  kind: 'collateralAllowanceChange' | 'daiAllowanceChange'
  value: {
    type:
      | Pick<ManageVaultState, 'selectedDaiAllowanceRadio'>
      | Pick<ManageVaultState, 'selectedCollateralAllowanceRadio'>
    amount: BigNumber
  }
}

type ManageVaultConfirm = {
  kind: 'manageVaultConfirm'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
  }
}

type ManageVaultConfirmTransaction = {
  kind: 'manageVaultConfirmTransaction'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
    txHash: string
  }
}

export function createManageVaultAnalytics$(
  manageVaultState$: Observable<ManageVaultState>,
  tracker: Tracker,
) {
  const stageChanges = manageVaultState$.pipe(
    map((state) => state.stage),
    filter((stage) => stage === 'daiEditing' || stage === 'collateralEditing'),
    distinctUntilChanged(isEqual),
  )

  const depositAmountChanges: Observable<DepositAmountChange> = manageVaultState$.pipe(
    map((state) => state.depositAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
    map((amount) => ({
      kind: 'depositAmountChange',
      value: amount,
    })),
  )

  const generateAmountChanges: Observable<GenerateAmountChange> = manageVaultState$.pipe(
    map((state) => state.generateAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
    map((amount) => ({
      kind: 'generateAmountChange',
      value: amount,
    })),
  )

  const paybackAmountChanges: Observable<PaybackAmountChange> = manageVaultState$.pipe(
    map((state) => state.paybackAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
    map((amount) => ({
      kind: 'paybackAmountChange',
      value: amount,
    })),
  )

  const withdrawAmountChanges: Observable<WithdrawAmountChange> = manageVaultState$.pipe(
    map((state) => state.withdrawAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
    map((amount) => ({
      kind: 'withdrawAmountChange',
      value: amount,
    })),
  )

  const collateralAllowanceTypeChanges: Observable<Pick<
    ManageVaultState,
    'selectedCollateralAllowanceRadio'
  >> = manageVaultState$.pipe(
    map((state) => state.selectedCollateralAllowanceRadio),
    distinctUntilChanged(isEqual),
  )

  const collateralAllowanceAmountChanges: Observable<BigNumber> = manageVaultState$.pipe(
    map((state) => state.collateralAllowanceAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
  )

  const collateralAllowanceChanges: Observable<AllowanceChange> = zip(
    collateralAllowanceTypeChanges,
    collateralAllowanceAmountChanges,
  ).pipe(
    map(([type, amount]) => ({
      kind: 'collateralAllowanceChange',
      value: {
        type,
        amount,
      },
    })),
  )

  const daiAllowanceTypeChanges: Observable<Pick<
    ManageVaultState,
    'selectedCollateralAllowanceRadio'
  >> = manageVaultState$.pipe(
    map((state) => state.selectedCollateralAllowanceRadio),
    distinctUntilChanged(isEqual),
  )

  const daiAllowanceAmountChanges: Observable<BigNumber> = manageVaultState$.pipe(
    map((state) => state.daiAllowanceAmount),
    filter((amount) => !!amount),
    distinctUntilChanged(isEqual),
    debounceTime(INPUT_DEBOUNCE_TIME),
  )

  const daiAllowanceChanges: Observable<AllowanceChange> = zip(
    daiAllowanceTypeChanges,
    daiAllowanceAmountChanges,
  ).pipe(
    map(([type, amount]) => ({
      kind: 'daiAllowanceChange',
      value: {
        type,
        amount,
      },
    })),
  )

  const manageVaultConfirm: Observable<ManageVaultConfirm> = manageVaultState$.pipe(
    filter((state) => state.stage === 'manageWaitingForApproval'),
    map(({ vault: { ilk }, depositAmount, withdrawAmount, generateAmount, paybackAmount }) => ({
      kind: 'manageVaultConfirm',
      value: {
        ilk: ilk,
        collateralAmount:
          depositAmount ||
          (withdrawAmount ? withdrawAmount.times(new BigNumber(-1)) : new BigNumber(0)),
        daiAmount:
          generateAmount ||
          (paybackAmount ? paybackAmount.times(new BigNumber(-1)) : new BigNumber(0)),
      },
    })),
    distinctUntilChanged(isEqual),
  )

  const manageVaultConfirmTransaction: Observable<ManageVaultConfirmTransaction> = manageVaultState$.pipe(
    filter((state) => state.stage === 'manageInProgress'),
    map(
      ({
        vault: { ilk },
        depositAmount,
        withdrawAmount,
        generateAmount,
        paybackAmount,
        manageTxHash,
      }) => ({
        kind: 'manageVaultConfirmTransaction',
        value: {
          ilk: ilk,
          collateralAmount:
            depositAmount ||
            (withdrawAmount ? withdrawAmount.times(new BigNumber(-1)) : new BigNumber(0)),
          daiAmount:
            generateAmount ||
            (paybackAmount ? paybackAmount.times(new BigNumber(-1)) : new BigNumber(0)),
          txHash: manageTxHash,
        },
      }),
    ),
    distinctUntilChanged(isEqual),
  )

  return stageChanges
    .pipe(
      switchMap((stage) =>
        merge(
          merge(
            depositAmountChanges,
            generateAmountChanges,
            paybackAmountChanges,
            withdrawAmountChanges,
            collateralAllowanceChanges,
            daiAllowanceChanges,
          ),
          merge(manageVaultConfirm, manageVaultConfirmTransaction),
        ).pipe(
          tap((event) => {
            const page = stage === 'daiEditing' ? Pages.ManageDai : Pages.ManageCollateral
            switch (event.kind) {
              case 'depositAmountChange':
                tracker.manageVaultDepositAmount(page, event.value.toString())
                break
              case 'generateAmountChange':
                tracker.manageVaultGenerateAmount(page, event.value.toString())
                break
              case 'paybackAmountChange':
                tracker.manageVaultPaybackAmount(page, event.value.toString())
                break
              case 'withdrawAmountChange':
                tracker.manageVaultWithdrawAmount(page, event.value.toString())
                break
              case 'collateralAllowanceChange':
                tracker.manageCollateralPickAllowance(
                  event.value.type.toString(),
                  event.value.amount.toString(),
                )
                break
              case 'daiAllowanceChange':
                tracker.manageDaiPickAllowance(
                  event.value.type.toString(),
                  event.value.amount.toString(),
                )
                break
              case 'manageVaultConfirm':
                tracker.manageVaultConfirm(
                  event.value.ilk,
                  event.value.collateralAmount.toString(),
                  event.value.daiAmount.toString(),
                )
                break
              case 'manageVaultConfirmTransaction':
                tracker.manageVaultConfirmTransaction(
                  event.value.ilk,
                  event.value.collateralAmount.toString(),
                  event.value.daiAmount.toString(),
                  event.value.txHash,
                )
                break
              default:
                throw new Error('Unhandled Scenario')
            }
          }),
        ),
      ),
    )
    .pipe()
}
