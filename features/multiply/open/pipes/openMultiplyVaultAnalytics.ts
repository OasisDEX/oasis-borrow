import { INPUT_DEBOUNCE_TIME } from 'analytics/analytics'
import type { Tracker } from 'analytics/trackingEvents'
import type BigNumber from 'bignumber.js'
import type { Context } from 'blockchain/network.types'
import { networkSetById } from 'blockchain/networks'
import type { AccountDetails } from 'features/account/AccountData'
import { formatOazoFee } from 'features/multiply/manage/utils'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, merge, zip } from 'rxjs'
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators'

import type {
  MutableOpenMultiplyVaultState,
  OpenMultiplyVaultState,
} from './openMultiplyVault.types'

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

type OpenMultiplyVaultConfirm = {
  kind: 'openMultiplyVaultConfirm'
  value: {
    ilk: string
    collateralAmount: BigNumber
    multiply: BigNumber
  }
}

type OpenMultiplyVaultConfirmTransaction = {
  kind: 'openMultiplyVaultConfirmTransaction'
  value: {
    ilk: string
    collateralAmount: BigNumber
    multiply: BigNumber
    txHash: string
    oasisFee: string
  }
}

export function createOpenMultiplyVaultAnalytics$(
  accountDetails$: Observable<AccountDetails>,
  openVaultState$: Observable<OpenMultiplyVaultState>,
  context$: Observable<Context>,
  tracker: Tracker,
) {
  const firstCDPChange: Observable<boolean | undefined> = accountDetails$.pipe(
    map(({ amountOfPositions }) => (amountOfPositions ? amountOfPositions === 0 : undefined)),
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

  const allowanceTypeChanges: Observable<
    Pick<MutableOpenMultiplyVaultState, 'selectedAllowanceRadio'>
  > = openVaultState$.pipe(
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

  const openMultiplyVaultConfirm: Observable<OpenMultiplyVaultConfirm> = openVaultState$.pipe(
    filter((state) => state.stage === 'txWaitingForApproval'),
    map(({ ilk, depositAmount, multiply }) => ({
      kind: 'openMultiplyVaultConfirm',
      value: {
        ilk: ilk,
        collateralAmount: depositAmount,
        // slight movements on market price are causing change of multiply
        // to counter that we round passed multiply to not have retriggered events
        multiply: multiply?.toFixed(3),
      },
    })),
    distinctUntilChanged(isEqual),
  )

  const openMultiplyVaultConfirmTransaction: Observable<OpenMultiplyVaultConfirmTransaction> =
    openVaultState$.pipe(
      filter((state) => state.stage === 'txInProgress'),
      map(({ ilk, depositAmount, openTxHash, multiply, oazoFee }) => ({
        kind: 'openMultiplyVaultConfirmTransaction',
        value: {
          ilk: ilk,
          collateralAmount: depositAmount,
          multiply: multiply?.toFixed(3),
          txHash: openTxHash,
          oasisFee: formatOazoFee(oazoFee),
        },
      })),
      distinctUntilChanged(isEqual),
    )

  return combineLatest(context$, firstCDPChange).pipe(
    switchMap(([context, firstCDP]) =>
      merge(
        depositAmountChanges,
        allowanceChanges,
        openMultiplyVaultConfirm,
        openMultiplyVaultConfirmTransaction,
      ).pipe(
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
            case 'openMultiplyVaultConfirm':
              tracker.multiply.confirmOpenMultiplyConfirm(
                event.value.ilk,
                firstCDP,
                event.value.collateralAmount.toString(),
                event.value.multiply.toString(),
              )
              break
            case 'openMultiplyVaultConfirmTransaction':
              const network = networkSetById[context.chainId].name
              const walletType = context.connectionKind

              tracker.multiply.confirmOpenMultiplyConfirmTransaction(
                event.value.ilk,
                firstCDP,
                event.value.collateralAmount.toString(),
                event.value.multiply.toString(),
                event.value.txHash,
                network,
                walletType,
                event.value.oasisFee,
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
