import BigNumber from "bignumber.js";
import { useAppContext } from "components/AppContextProvider";
import { VaultContainerSpinner, WithLoadingIndicator } from "helpers/AppSpinner";
import { useObservableWithError } from "helpers/observableHook";
import React from "react";

export function ProtectionDetails({ id }: { id: BigNumber }) {
    const { stopLossTriggersData$} = useAppContext();
    const slTriggerData$ = stopLossTriggersData$(id);
    const slTriggerDataWithError = useObservableWithError(slTriggerData$)
    return (
        
      <WithLoadingIndicator
      value={[
        slTriggerDataWithError.value
      ]}
      customLoader={<VaultContainerSpinner />}
    >
        {
            ([triggerrsData])=>{
                return (
                    <h1>TODO Protection Level = {triggerrsData.stopLossLevel},
                     CloseToCollateral = {triggerrsData.isToCollateral},
                     </h1>
                )
            }
        }
    </WithLoadingIndicator>
    )
}