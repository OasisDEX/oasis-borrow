import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { Observable} from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { TriggerRecord, TriggersData } from '../AutomationTriggersData';


const STOP_LOSS_TRIGGER_TYPE_COLL = 1;
const STOP_LOSS_TRIGGER_TYPE_DAI = 2;


const getSLLevel = function(rawBytes : string) : BigNumber{
    /* TODO: Some event data parsing here in a future */
    return new BigNumber(1.95);
}

export interface StopLossTriggerData {
    isStopLossEnabled: boolean
    stopLossLevel: BigNumber
    isToCollateral: boolean
  }

export function createStopLossTriggersData(
    triggersData$: Observable<TriggersData>
):
Observable<StopLossTriggerData>{

    return triggersData$.pipe( 
        filter((data)=>{
            const  validElements = _.filter(data.triggers,(x=>x.triggerType === STOP_LOSS_TRIGGER_TYPE_COLL || x.triggerType === STOP_LOSS_TRIGGER_TYPE_DAI ));
            return validElements.length>0
        })
        ,
        map((data)=>{

            const doesStopLossExist = data.triggers?(data.triggers.length>0):false;
            if(doesStopLossExist){
                let slRecord : TriggerRecord | undefined;
                slRecord = data.triggers?_.last(data.triggers):undefined;
                if(!slRecord) throw "illegal state"; /* TODO: This is logically unreachable, revrite so typecheck works */
                return {
                    isStopLossEnabled : true,
                    stopLossLevel : getSLLevel(slRecord.executionParams),
                    isToCollateral : slRecord.triggerType === STOP_LOSS_TRIGGER_TYPE_COLL
                } as StopLossTriggerData
            }else{
                return {
                    isStopLossEnabled : false,
                    stopLossLevel : new BigNumber(0)
                } as StopLossTriggerData
            }            
        })
    )
};
