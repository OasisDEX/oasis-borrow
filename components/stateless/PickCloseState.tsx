import { useState } from "react";
import { Grid } from "@theme-ui/components";
import { CloseVaultCard } from "components/vault/CloseVaultCard";
import React from "react";
import { propSatisfies } from "ramda";

export interface PickCloseStateProps{
    collateralTokenSymbol: string
    collateralTokenIconCircle: string
    optionNames:string[2]
    onclickHandler: (optionName:string) => void
    isFirstActive: boolean
}

export function PickCloseState(props: PickCloseStateProps){

    const [isActive,setIsActive] = useState(props.isFirstActive);

    const OnClickHandler = (op:string) => {
            setIsActive(op === props.optionNames[0]);
            props.onclickHandler(op);
        };

    return (
        <Grid columns={2}>
        <CloseVaultCard
          text={`Close to ${props.collateralTokenSymbol}`}
          icon={props.collateralTokenIconCircle}
          onClick={OnClickHandler}
          isActive={isActive}
          optionName={props.optionNames[0]}
        />
        <CloseVaultCard
          text="Close to DAI"
          icon="dai_circle_color"
          onClick={OnClickHandler}
          isActive={!isActive}
          optionName={props.optionNames[1]}
        />
      </Grid>
    )
}