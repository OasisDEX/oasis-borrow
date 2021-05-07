import { INPUT_DEBOUNCE_TIME, Tracker } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { isEqual } from 'lodash'
import { merge, Observable, zip } from 'rxjs'
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs/operators'

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

export function createOpenVaultAnalytics$(
  openVaultState$: Observable<OpenVaultState>,
  tracker: Tracker,
) {
  const depositAmountChanges: Observable<DepositAmountChange> = openVaultState$.pipe(
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

  return merge(depositAmountChanges, generateAmountChanges, allowanceChanges).pipe(
    tap((event) => {
      switch (event.kind) {
        case 'depositAmountChange':
          tracker.createVaultDeposit(event.value.toString())
          break
        case 'generateAmountChange':
          tracker.createVaultGenerate(event.value.toString())
          break
        case 'allowanceChange':
          tracker.pickAllowance(event.value.type.toString(), event.value.amount.toString())
          break
        default:
          throw new Error('Unhandled Scenario')
      }
    }),
  )
}
