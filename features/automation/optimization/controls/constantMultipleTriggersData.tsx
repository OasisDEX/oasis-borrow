import { CommandContractType, TriggerType } from "@oasisdex/automation";
import BigNumber from "bignumber.js";
import { AutomationBotAddAggregatorTriggerData } from "blockchain/calls/automationBotAggregator";
import { TxMetaKind } from "blockchain/calls/txMeta";
import { encodeArray } from "blockchain/utils";
import { Vault } from "blockchain/vaults";
import { prepareBasicBSTriggerData } from "features/automation/common/basicBSTriggerData";
import { CONSTANT_MULTIPLE_GROUP_TYPE } from "features/automation/protection/useConstantMultipleStateInitialization";

export function prepareAddConstantMultipleTriggerData({
    groupId,
    vaultData,
    maxBuyPrice,
    minSellPrice,
    buyExecutionCollRatio,
    sellExecutionCollRatio,
    buyWithThreshold,
    sellWithThreshold,
    targetCollRatio,
    continuous,
    deviation,
    maxBaseFeeInGwei,
    // multiplier,
}: {
    groupId: BigNumber
    vaultData: Vault
    maxBuyPrice: BigNumber
    minSellPrice: BigNumber
    buyExecutionCollRatio: BigNumber
    sellExecutionCollRatio: BigNumber
    buyWithThreshold: boolean
    sellWithThreshold: boolean
    targetCollRatio: BigNumber
    continuous: boolean
    deviation: BigNumber
    maxBaseFeeInGwei: BigNumber
    // multiplier: number 
}):  AutomationBotAddAggregatorTriggerData{
    const dataForBuy = [
        vaultData.id.toString(),
        maxBuyPrice?.toString(),
        minSellPrice?.toString(),
        buyExecutionCollRatio?.toString(),
        sellExecutionCollRatio?.toString(),
        buyWithThreshold?.toString(),
        sellWithThreshold?.toString(),
        targetCollRatio?.toString(),
        continuous.toString(),
        deviation.times(100).toString(),
        maxBaseFeeInGwei.toString(),
    ]

    const buyTriggerData = prepareBasicBSTriggerData({
        vaultData,
        triggerType: TriggerType.BasicBuy,
        execCollRatio: buyExecutionCollRatio,
        targetCollRatio,
        maxBuyOrMinSellPrice: maxBuyPrice,
        continuous,
        deviation,
        maxBaseFeeInGwei,
      })

console.log('buyTriggerData')
console.log(buyTriggerData)

    const sellTriggerData  = prepareBasicBSTriggerData({
        vaultData,
        triggerType: TriggerType.BasicSell,
        execCollRatio: sellExecutionCollRatio,
        targetCollRatio,
        maxBuyOrMinSellPrice: minSellPrice,
        continuous,
        deviation,
        maxBaseFeeInGwei,
      })
    
console.log('sellTriggerData')
console.log(sellTriggerData)

    // groupId: BigNumber
    // groupTypeId: string,
    // replacedTriggerId: string,
    // triggersData: string,
    // proxyAddress: string
    // kind: TxMetaKind.addTriggerGroup

    // const triggersData = "0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000133000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007530ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001330000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000075300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000064"
    
    // const replacedTriggerId= "00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000"
    return {
        // groupId,
        groupTypeId: CONSTANT_MULTIPLE_GROUP_TYPE,
        replacedTriggerId: [0,0],
        // triggersData: encodeArray([buyTriggerData.triggerData, sellTriggerData.triggerData]),
        triggersData: [buyTriggerData.triggerData, sellTriggerData.triggerData],
        proxyAddress: vaultData.owner,
        kind: TxMetaKind.addTriggerGroup,
    }

}