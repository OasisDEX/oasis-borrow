import { Web3Context } from "@oasisdex/web3-context";
import { filter, switchMap, map, startWith } from "rxjs/operators";
import { combineLatest, Observable, of } from "rxjs";
import { ContextConnected } from "blockchain/network";
import BigNumber from "bignumber.js";

export function createAccountData(
    context$: Observable<Web3Context>,
    balance$: (token: string, address: string) => Observable<BigNumber>
) {
    return context$.pipe(
        switchMap(context => combineLatest(
            of(context),
            of(context).pipe(
                filter((context): context is ContextConnected => context.status === 'connected'),
                switchMap(context => balance$('DAI', context.account).pipe(
                    startWith<undefined | BigNumber>(undefined)
                ))
            )
        )),
        map(([context, balance]) => ({
            context,
            daiBalance: balance
        }))
    )
}