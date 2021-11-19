import BigNumber from 'bignumber.js'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults';
import { startWithDefault } from 'helpers/operators';
import { List } from 'lodash'
import { Observable, from, combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
const STOP_LOSS_TRIGGER_TYPE_COLL = 1;
const STOP_LOSS_TRIGGER_TYPE_DAI = 2;

export interface TriggerRecord{
    triggerId : number
    triggerType : number
    executionParams : string /* bytes triggerData  from TriggerAdded event*/
}

export interface TriggersData {
  isAutomationEnabled: boolean
  triggers: List<TriggerRecord> | undefined
}

export function createAutomationTriggersData(
    context$: Observable<ContextConnected>,
    onEveryBlock$: Observable<number>,
    vauit$: (id: BigNumber) => Observable<Vault>,
    id:BigNumber,
):
Observable<TriggersData>{
    return context$.pipe(
        filter((context): context is ContextConnected => context.status === 'connected'),
        switchMap((context) =>
        combineLatest(
            startWithDefault(onEveryBlock$, undefined),
            startWithDefault(vauit$(id/*,context.chainId*/), undefined),
        ).pipe(
            map(([blockNumber, vault]) => {        
                let x = {
                    isAutomationEnabled : true,
                    triggers : generateFromVault(vault?.id)
                } as TriggersData;
                return x;
            }),
        ),
        ),
    )
};
function generateFromVault(id: BigNumber | undefined): List<TriggerRecord>  {
    /* TODO: replace with actual Event reading when ready and in final version with fetching from cache */
    switch((id?id.toNumber():0)%4){
        case 0:
            return [{
                triggerId:1,
                triggerType: STOP_LOSS_TRIGGER_TYPE_COLL,
                executionParams:"0x1234"
            } as TriggerRecord] as List<TriggerRecord>
        case 1:
            return [{
                triggerId:1,
                triggerType: STOP_LOSS_TRIGGER_TYPE_DAI,
                executionParams:"0x1234"
            } as TriggerRecord] as List<TriggerRecord>
        case 2:
        case 3:
            return [] as List<TriggerRecord>

    }
    throw new Error('Function not implemented.');
}

