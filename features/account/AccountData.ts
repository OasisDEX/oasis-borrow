import { Web3Context } from "@oasisdex/web3-context";
import BigNumber from "bignumber.js";
import { ContextConnected } from "blockchain/network";
import { Observable, of } from "rxjs";
import { filter, map, startWith,switchMap } from "rxjs/operators";

export function createAccountData(
    context$: Observable<Web3Context>,
    balance$: (token: string, address: string) => Observable<BigNumber>
) {
    return context$.pipe(
        switchMap(context =>
            of(context).pipe(
                filter((context): context is ContextConnected => context.status === 'connected'),
                switchMap(context => balance$('DAI', context.account)),
                startWith<undefined | BigNumber>(undefined)
            ).pipe(
                map((balance) => ({
                    context,
                    daiBalance: balance
                }))
            )
        ),
    )
}