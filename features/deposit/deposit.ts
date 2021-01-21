import BigNumber from "bignumber.js"
import { TransactionDef } from "components/blockchain/calls/callsHelpers"
import { tokenBalance, TokenBalanceArgs } from "components/blockchain/calls/erc20"
import { CallObservable } from "components/blockchain/calls/observe"
import { TxMetaKind } from "components/blockchain/calls/txMeta"
import { contractDesc } from "components/blockchain/config"
import { Context, ContextConnected } from "components/blockchain/network"
import { Changes, applyChange, ApplyChange, Change, transactionToX } from "helpers/form"
import { merge, Observable, of, Subject, combineLatest } from "rxjs"
import { distinctUntilChanged, filter, first, map, mapTo, mergeMap, pluck, scan, shareReplay, startWith, switchMap, tap } from "rxjs/operators"
import { Vault } from "../vaults/vault"

import dsProxy from 'components/blockchain/abi/ds-proxy.json'
import { DsProxy } from "types/web3-v1-contracts/ds-proxy"
import { contract } from "@oasisdex/web3-context"
import { amountToWei } from "components/blockchain/utils"
import { amountFromWei } from "@oasisdex/utils"
import { DssProxyActions } from "types/web3-v1-contracts/dss-proxy-actions"
import { TxHelpers } from "components/AppContext"
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
}

type StateChange = Changes<DepositState>
type ManualChange = Change<DepositState, 'lockAmount'> | Change<DepositState, 'drawAmount'>

const apply: ApplyChange<DepositState> = applyChange

enum ErrorMessages {
    InsufficientFunds = 'insufficient_founds'
}

export type LockAndDrawData = {
    kind: TxMetaKind.lockAndDraw
    id?: string
    tkn: string
    ilk: string
    lockAmount: BigNumber 
    drawAmount: BigNumber 
    proxyAddress: string
}

function getCallData(data: LockAndDrawData, context: ContextConnected) {
    const { dssProxyActions, dssCdpManager, mcdJoinDai, mcdJug, joins, contract } = context;
    const {id, tkn, lockAmount, drawAmount, ilk} = data;

    if(id && tkn === 'ETH') {
        console.log('CALL DATA', dssCdpManager.address, mcdJug.address, joins[ilk] , mcdJoinDai.address, id, amountToWei(drawAmount, 'DAI').toString())
        return contract<DssProxyActions>(dssProxyActions).methods.lockETHAndDraw(
            dssCdpManager.address, mcdJug.address, joins[ilk] , mcdJoinDai.address, id, amountToWei(drawAmount, 'DAI').toString()
        )
    }
    if (tkn === 'ETH') {
        return contract<DssProxyActions>(dssProxyActions).methods.openLockETHAndDraw(
            dssCdpManager.address, mcdJug.address, joins[ilk], mcdJoinDai.address, ilk, amountToWei(drawAmount, 'DAI').toString()
        )
    }
    if(!id && tkn === 'GNT') {
        return contract<DssProxyActions>(dssProxyActions).methods.openLockGNTAndDraw(
            dssCdpManager.address, mcdJug.address, joins[ilk], mcdJoinDai.address, ilk, amountToWei(lockAmount, 'GNT').toString(), amountToWei(drawAmount, 'DAI').toString()
        )
    }
    if (id) {
        return contract<DssProxyActions>(dssProxyActions).methods.lockGemAndDraw(
            dssProxyActions.address, mcdJug.address, joins[ilk], mcdJoinDai.address, id, amountToWei(lockAmount, tkn).toString(), amountToWei(drawAmount, 'DAI').toString(), true
        )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.openLockGemAndDraw(
        dssProxyActions.address, mcdJug.address, joins[ilk], mcdJoinDai.address, ilk, amountToWei(lockAmount, tkn).toString(), amountToWei(drawAmount, 'DAI').toString(), true
    )
}

const lockAndDraw: TransactionDef<LockAndDrawData> = {
    call: ({ proxyAddress }, { contract }) => {
        return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods.execute
    },
    prepareArgs: (data, context) => {
        const { dssProxyActions } = context;
        return [dssProxyActions.address, getCallData(data, context).encodeABI()]
    },
    options: ({tkn, lockAmount}) => tkn === 'ETH' ? {value: amountToWei(lockAmount, 'ETH').toString() } : {}
}

function validate(state: DepositState): DepositState {
 const messages = []

 if (state.lockAmount?.gt(state.ethBalance)) {
     messages.push(ErrorMessages.InsufficientFunds)
 }

 return { ...state, messages }
}

function submit(txHelpers: TxHelpers, change: (ch: StateChange) => void, state: DepositState) {
    return txHelpers.sendWithGasEstimation(lockAndDraw, {
        drawAmount: state.drawAmount!,
        ilk: state.vault.ilk,
        tkn: state.vault.token,
        kind: TxMetaKind.lockAndDraw,
        lockAmount: state.lockAmount!,
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
    if(state.messages.length === 0 && state.lockAmount && state.drawAmount) {
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
        map(([{balance}, {vault}, {ethBalance}, t]) => [balance, vault, ethBalance, t] as const),
        switchMap(([balance, vault, ethBalance, txHelpers]) => {
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