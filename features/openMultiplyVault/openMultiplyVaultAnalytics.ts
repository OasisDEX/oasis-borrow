import { INPUT_DEBOUNCE_TIME, Tracker } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { AccountDetails } from 'features/account/AccountData'
import { isEqual } from 'lodash'
import { merge, Observable, zip } from 'rxjs'
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators'

import { MutableOpenMultiplyVaultState, OpenMultiplyVaultState } from './openMultiplyVault'

type DepositAmountChange = {
  kind: 'depositAmountChange'
  value: BigNumber
}

type AllowanceChange = {
  kind: 'allowanceChange'
  value: {
    type: Pick<MutableOpenMultiplyVaultState, 'selectedAllowanceRadio'>
    amount: BigNumber
  }
}

export function createOpenMultiplyVaultAnalytics$(
  accountDetails$: Observable<AccountDetails>,
  openVaultState$: Observable<OpenMultiplyVaultState>,
  tracker: Tracker,
) {
  const firstCDPChange: Observable<boolean | undefined> = accountDetails$.pipe(
    map(({ numberOfVaults }) => (numberOfVaults ? numberOfVaults === 0 : undefined)),
    distinctUntilChanged(isEqual),
  )

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
    MutableOpenMultiplyVaultState,
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

  return firstCDPChange.pipe(
    switchMap((firstCDP) =>
      merge(depositAmountChanges, allowanceChanges).pipe(
        tap((event) => {
          switch (event.kind) {
            case 'depositAmountChange':
              tracker.createVaultDeposit(firstCDP, event.value.toString())
              break
            case 'allowanceChange':
              tracker.pickAllowance(
                firstCDP,
                event.value.type.toString(),
                event.value.amount.toString(),
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
