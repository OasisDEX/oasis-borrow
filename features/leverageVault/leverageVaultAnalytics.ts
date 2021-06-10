import { INPUT_DEBOUNCE_TIME, Tracker } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { isEqual } from 'lodash'
import { merge, Observable, zip } from 'rxjs'
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs/operators'

import { LeverageVaultState,MutableLeverageVaultState } from './leverageVault'

type DepositAmountChange = {
  kind: 'depositAmountChange'
  value: BigNumber
}

type AllowanceChange = {
  kind: 'allowanceChange'
  value: {
    type: Pick<MutableLeverageVaultState, 'selectedAllowanceRadio'>
    amount: BigNumber
  }
}

export function createOpenVaultAnalytics$(
  openVaultState$: Observable<LeverageVaultState>,
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

  const allowanceTypeChanges: Observable<Pick<
    MutableLeverageVaultState,
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

  return merge(depositAmountChanges, allowanceChanges).pipe(
    tap((event) => {
      switch (event.kind) {
        case 'depositAmountChange':
          tracker.createVaultDeposit(event.value.toString())
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
