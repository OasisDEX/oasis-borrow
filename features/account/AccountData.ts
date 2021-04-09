import { Web3Context } from "@oasisdex/web3-context";
import BigNumber from "bignumber.js";
import { ContextConnected } from "blockchain/network";
import { Vault } from "blockchain/vaults";
import { combineLatest, Observable, of } from "rxjs";
import { filter, map, startWith, switchMap } from "rxjs/operators";

export function createAccountData(
    context$: Observable<Web3Context>,
    balance$: (token: string, address: string) => Observable<BigNumber>,
    vaults$: (address: string) => Observable<Vault[]>
) {
    return context$.pipe(
        switchMap(context =>
            combineLatest([
                of(context).pipe(
                    filter((context): context is ContextConnected => context.status === 'connected'),
                    switchMap(context => balance$('DAI', context.account)),
                    startWith<undefined | BigNumber>(undefined)
                ),
                of(context).pipe(
                    filter((context): context is ContextConnected => context.status === 'connected'),
                    switchMap(context => vaults$(context.account)),
                    map(vaults => vaults.length),
                    startWith<undefined | number>(undefined)
                )
            ]).pipe(
                map(([balance, numberOfVaults]) => ({
                    context,
                    numberOfVaults,
                    daiBalance: balance
                }))
            )
        ),
    )
}