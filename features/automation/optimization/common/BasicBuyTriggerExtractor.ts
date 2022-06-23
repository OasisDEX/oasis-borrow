import { CommandContractType, encodeTriggerDataByType } from "@oasisdex/automation";
import BigNumber from "bignumber.js";
import { Vault } from "blockchain/vaults";
import { TriggerType } from "features/automation/protection/common/enums/TriggersTypes";

export interface BasicBuyTriggerCreationData {
    cdpId: BigNumber
    triggerType: BigNumber
    execCollRatio: BigNumber
    targetCollRatio: BigNumber
    maxBuyPrice: BigNumber
    continuous: boolean
    deviation: BigNumber
    triggerData: string
}

export function prepareBasicBuyTriggerCreationData(
    vaultData: Vault,
    execCollRatio: BigNumber,
    targetCollRatio: BigNumber,
    maxBuyPrice: BigNumber,
    continuous: boolean,
    deviation: BigNumber,
) {
    const triggerType = new BigNumber(TriggerType.BasicBuy)
    return {
        cdpId: vaultData.id,
        triggerType,
        execCollRatio,
        targetCollRatio,
        maxBuyPrice,
        continuous,
        deviation,
        triggerData: encodeTriggerDataByType(CommandContractType.BasicBuyCommand, [
            vaultData.id.toString(),
            triggerType.toString(),
            execCollRatio.toString(),
            targetCollRatio.toString(),
            maxBuyPrice.toString(),
            continuous.toString(),
            deviation.toString(),
        ])
    }
}