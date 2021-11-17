import { Grid, Button } from "@theme-ui/components";
import { Container } from "next/app";
import React, { useState } from "react";

enum VaultViewMode{
    History=1,
    Protection=2,
    Overview=3
  }

export function TabSwitch({defaultMode,overViewControl,historyControl,protectionControl} : {defaultMode : VaultViewMode,
  overViewControl: JSX.Element,
  historyControl?: JSX.Element,
  protectionControl?:JSX.Element}): JSX.Element {
  const [mode,setMode] = useState<VaultViewMode>(defaultMode);
  
  function handleToggle(newMode: VaultViewMode) {
    setMode(newMode);
  }
  return (

<Grid gap={0} sx={{ width: '100%' }}>
          
<Grid columns={3} variant="vaultEditingControllerContainer">
  <Button onClick={() => handleToggle(VaultViewMode.Overview)} >
    Overview
  </Button>
  <Button onClick={() => handleToggle(VaultViewMode.Protection)} >
    Protection
  </Button>
  <Button onClick={() => handleToggle(VaultViewMode.History)}>
    History
  </Button>
</Grid>
<Container>
  {
   mode===VaultViewMode.Overview?overViewControl:(
    mode===VaultViewMode.Protection?protectionControl:historyControl
  )
  }
</Container>
</Grid>

);
}

export {VaultViewMode};