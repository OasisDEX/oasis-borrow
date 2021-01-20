import BigNumber from "bignumber.js"
import { tokenBalance, TokenBalanceArgs } from "components/blockchain/calls/erc20"
import { CallObservable } from "components/blockchain/calls/observe"
import { Context, ContextConnected } from "components/blockchain/network"
import { Changes, applyChange, ApplyChange, Change } from "helpers/form"
import { merge, Observable, of, Subject, combineLatest } from "rxjs"
import { distinctUntilChanged, filter, first, map, mapTo, mergeMap, pluck, scan, shareReplay, startWith, switchMap, tap } from "rxjs/operators"
import { Vault } from "./vaults/vault"


interface State {
    balance: BigNumber
    depositAmount?: BigNumber
    generateAmount?: BigNumber
    vault: Vault
    messages: string[]
    change(change: ManualChange): void
    submit?(): void
}

type StateChanges = Changes<State>
type ManualChange = Change<State, 'depositAmount'> | Change<State, 'generateAmount'>

const apply: ApplyChange<State> = applyChange

enum ErrorMessages {
    InsufficientFunds = 'insufficient_founds'
}

function validate(state: State): State {
 const messages = []

 if(state.depositAmount?.gt(state.balance)) {
     messages.push(ErrorMessages.InsufficientFunds)
 }

 return { ...state, messages }
}

function submit(state: State) {
    return () => {

    }
}
export function createDepositForm$(
    context$: Observable<ContextConnected>,
    balance$: CallObservable<typeof tokenBalance>,
    vault$: (id: BigNumber) => Observable<Vault>,
    id: BigNumber,
): Observable<State> {
    const change$ = new Subject<StateChanges>()
    function change(ch: StateChanges) {
        change$.next(ch)
    }

    const initialState = {
        messages: [],
        change
    }

    change$.subscribe(console.log)

    const balanceChange$ = combineLatest(context$, vault$(id)).pipe(
        switchMap(([context, vault]) =>
            balance$({ account: context.account, token: vault.token })
        ),
        map(balance => ({ kind: 'balance', balance })),
        tap(v => console.log('balance', v))
    )

    const vaultChange$ = vault$(id).pipe(
        map(vault => ({ kind: 'vault', vault})),
        tap(v => console.log('vault', v))
    )

    return combineLatest(balanceChange$, vaultChange$).pipe(
        first(),
        mergeMap(([{balance}, {vault}]) => {
            const initial = {...initialState, balance, vault}
            return merge(change$, balanceChange$, vaultChange$).pipe(
            scan(apply, initial),
            map(validate),
            startWith(initial)
        )}),
        shareReplay(1)
    )
    
   
}