import { Box, Button, Grid } from '@theme-ui/components'
import React, { useState } from 'react'

enum VaultViewMode {
  History = 1,
  Protection = 2,
  Overview = 3,
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
  const padding = { paddingTop: '1px', paddingBottom: '1px' }

  function getVariant(currentMode: VaultViewMode, activeMode: VaultViewMode) {
    return currentMode === activeMode ? 'primary' : 'secondary'
  }

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <Grid
        columns={3}
        sx={{ paddingTop: '4px', paddingBottom: '4px', zIndex: 1, width: '40%' }}
        variant="vaultEditingControllerContainer"
      >
        <Button
          sx={{ ...padding }}
          onClick={() => setMode(VaultViewMode.Overview)}
          variant={getVariant(mode, VaultViewMode.Overview)}
        >
          Overview
        </Button>
        <Button
          sx={{ ...padding }}
          onClick={() => setMode(VaultViewMode.Protection)}
          variant={getVariant(mode, VaultViewMode.Protection)}
        >
          Protection
        </Button>
        <Button
          sx={{ ...padding }}
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
