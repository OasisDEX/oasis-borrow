import BigNumber from "bignumber.js"
import { TokenBalanceArgs } from "components/blockchain/calls/erc20"
import { Context, ContextConnected } from "components/blockchain/network"
import { Changes, applyChange, ApplyChange } from "helpers/form"
import { merge, Observable, of, Subject } from "rxjs"
import { distinctUntilChanged, filter, map, mapTo, mergeMap, pluck, scan, shareReplay, startWith, switchMap, tap } from "rxjs/operators"


interface StateStatic {
    amount: number
    token: string
    messages: string[]
}

interface State extends StateStatic {
    change(change: StateChanges): void
    submit?(): void
}

type StateChanges = Changes<StateStatic>

const apply: ApplyChange<State> = applyChange

export function createDepositForm(context$: Observable<ContextConnected>, balance$: (args: TokenBalanceArgs) => Observable<BigNumber>): Observable<State> {
    const initialState = {
        amount: 0,
        messages: [],
        token: ''
    }
    const change$ = new Subject<StateChanges>()
    function change(ch: StateChanges) {
      change$.next(ch)
    }

    function submit(state: State) {
        return () => {

        }
    }

    const tokenBalance$ = (token: string) => context$.pipe(
        mergeMap(ctx => balance$({account: ctx.account, token})),
        shareReplay(1),
    )

    function validate(state: State): Observable<State> {        
        return of(state).pipe(
            switchMap(() => tokenBalance$(state.token)),
            map(tokenBalance => ({
                ...state, 
                messages: tokenBalance.isGreaterThanOrEqualTo(state.amount) 
                    ? state.messages
                    : [...state.messages, 'Insufficient ETH balance']
            })),
        )
    }
   
    const state: State = {
      ...initialState,
      change,
    }

    change$.subscribe(console.log)
  
    return merge(change$).pipe(
      scan(apply, state),
      mergeMap(validate),
      startWith(state),
      map(state => ({...state, submit: submit(state)})),
      tap(console.log),
      shareReplay(1),
    )
  }