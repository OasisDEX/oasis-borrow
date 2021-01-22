import BigNumber from "bignumber.js"
import { tokenBalance } from "components/blockchain/calls/erc20"
import { CallObservable } from "components/blockchain/calls/observe"
import { TxMetaKind } from "components/blockchain/calls/txMeta"
import { ContextConnected } from "components/blockchain/network"
import { Changes, applyChange, ApplyChange, Change, transactionToX } from "helpers/form"
import { merge, Observable, of, Subject, combineLatest } from "rxjs"
import { first, map, scan, shareReplay, startWith, switchMap } from "rxjs/operators"
import { Vault } from "../vaults/vault"
import { TxHelpers } from "components/AppContext"
import { lockAndDraw } from "../../components/blockchain/calls/lockAndDraw"
import { curry } from "ramda"

export type DepositStage =
  | 'editing'
  | 'waiting4Confirmation'
  | 'waiting4Approval'
  | 'inProgress'
  | 'fiasco'
  | 'success'

interface DepositState {
    txHash?: string, 
    stage: DepositStage
    ethBalance: BigNumber
    balance: BigNumber
    lockAmount?: BigNumber
    drawAmount?: BigNumber
    vault: Vault
    messages: string[]
    change(change: ManualChange): void
    submit?(): void
    reset?(): void
}

type StateChange = Changes<DepositState>
type ManualChange = Change<DepositState, 'lockAmount'> | Change<DepositState, 'drawAmount'>

const apply: ApplyChange<DepositState> = applyChange

type ErrorMessages = 'insufficientFounds' | 'minimumDebt'

export type LockAndDrawData = {
    kind: TxMetaKind.lockAndDraw
    id?: string
    tkn: string
    ilk: string
    lockAmount: BigNumber 
    drawAmount: BigNumber 
    proxyAddress: string
}

function validate(state: DepositState): DepositState {
 const messages: ErrorMessages[] = []

 if (state.lockAmount?.gt(state.ethBalance)) {
     messages.push('insufficientFounds')
 }

 if (state.vault.debtFloor.gte(state.vault.debt.plus(state.drawAmount || 0))) {
     console.log(state.vault.debtFloor.toString())
     messages.push('minimumDebt')
 }

 return { ...state, messages }
}

function submit(txHelpers: TxHelpers, change: (ch: StateChange) => void, state: DepositState) {
    return txHelpers.send(lockAndDraw, {
        drawAmount: state.drawAmount || new BigNumber(0),
        lockAmount: state.lockAmount || new BigNumber(0),
        ilk: state.vault.ilk,
        tkn: state.vault.token,
        kind: TxMetaKind.lockAndDraw,
        proxyAddress: state.vault.owner,
        id: state.vault.id,
    }).pipe(
        transactionToX<StateChange, LockAndDrawData>(
            { kind: 'stage', stage: 'waiting4Approval' },
            (txState) =>
              of(
                { kind: 'txHash', txHash: (txState as any).txHash as string },
                { kind: 'stage', stage: 'inProgress' },
              ),
            { kind: 'stage', stage: 'fiasco' },
            () => of({ kind: 'stage', stage: 'success' }),
          )
    ).subscribe(change)
}

function addTransitions(txHelpers: TxHelpers, change: (ch: StateChange) => void, state: DepositState): DepositState {
    if (state.stage === 'fiasco' || state.stage === 'success') {
        return {
            ...state,
            reset: () => {
                change({kind: 'stage', stage: 'editing'})
                change({kind: 'drawAmount', drawAmount: undefined})
                change({kind: 'lockAmount', lockAmount: undefined})
            }
        }
    }
    if (state.messages.length === 0 && (state.lockAmount || state.drawAmount)) {
        return {
            ...state,
            submit: () => submit(txHelpers, change, state)
        }
    }
    return state
}

export function createDepositForm$(
    context$: Observable<ContextConnected>,
    balance$: CallObservable<typeof tokenBalance>,
    txHelpers$: Observable<TxHelpers>,
    vault$: (id: BigNumber) => Observable<Vault>,
    ethBalance$: (address: string) => Observable<BigNumber>,
    id: BigNumber,
): Observable<DepositState> {
    const change$ = new Subject<StateChange>()
    function change(ch: StateChange) {
    change$.next(ch)
    }

    const balanceChange$ = combineLatest(context$, vault$(id)).pipe(
        switchMap(([context, vault]) =>
            balance$({ account: context.account, token: vault.token })
        ),
        map(balance => ({ kind: 'balance' as const, balance })),
    )

    const vaultChange$ = vault$(id).pipe(
        map(vault => ({ kind: 'vault' as const, vault})),
    )

    const ethBalanceChange$ = context$.pipe(
        switchMap(context => ethBalance$(context.account)),
        map(ethBalance => ({kind: 'ethBalance' as const, ethBalance}))
    )

    return combineLatest(balanceChange$, vaultChange$, ethBalanceChange$, txHelpers$).pipe(
        first(),
        switchMap(([{balance}, {vault}, {ethBalance}, txHelpers]) => {
            const initial: DepositState = { 
                stage: 'editing',
                change, 
                messages: [], 
                balance, 
                vault, 
                ethBalance
            }
            const mapState = curry(addTransitions)(txHelpers, change)

            return merge(change$, balanceChange$, vaultChange$).pipe(
                scan(apply, initial),
                map(validate),
                map(mapState),
                startWith(initial)
        )}),
        shareReplay(1)
    )
    
   
}