import { Box, Button, Grid } from '@theme-ui/components'
import React, { useState } from 'react'

enum VaultViewMode {
  History,
  Protection,
  Overview,
}

export function TabSwitchLayout({
  defaultMode,
  overViewControl,
  historyControl,
  protectionControl,
}: {
  defaultMode: VaultViewMode
  overViewControl: JSX.Element
  historyControl?: JSX.Element
  protectionControl?: JSX.Element
}): JSX.Element {
  const [mode, setMode] = useState<VaultViewMode>(defaultMode)

  function getVariant(currentMode: VaultViewMode, activeMode: VaultViewMode) {
    return currentMode === activeMode ? 'tab' : 'tabInactive'
  }

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <Grid
        columns={3}
        sx={{ zIndex: 1, width: '40%', backgroundColor: 'fadedWhite' }}
        variant="vaultEditingControllerContainer"
      >
        <Button
          onClick={() => setMode(VaultViewMode.Overview)}
          variant={getVariant(mode, VaultViewMode.Overview)}
        >
          Overview
        </Button>
        <Button
          onClick={() => setMode(VaultViewMode.Protection)}
          variant={getVariant(mode, VaultViewMode.Protection)}
        >
          Protection
        </Button>
        <Button
          onClick={() => setMode(VaultViewMode.History)}
          variant={getVariant(mode, VaultViewMode.History)}
        >
          History
        </Button>
      </Grid>
      <Box sx={{ zIndex: 1 }}>
        {mode === VaultViewMode.Overview
          ? overViewControl
          : mode === VaultViewMode.Protection
          ? protectionControl
          : historyControl}
      </Box>
    </Grid>
  )
}

export { VaultViewMode }
