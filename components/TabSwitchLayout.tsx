import { Box, Button, Grid } from '@theme-ui/components'
import { TAB_CHANGE_SUBJECT, TabChange } from 'features/automation/common/UITypes/TabChange'
import React, { useEffect, useState } from 'react'
import { Flex, Heading } from 'theme-ui'

import { useAppContext } from './AppContextProvider'

enum VaultViewMode {
  History,
  Protection,
  Overview,
}
//TODO: make number of tabs and labels and controls configurable - refactor replace it with TabSwitcher ~ŁW
export function TabSwitchLayout({
  defaultMode,
  heading,
  headerControl,
  overViewControl,
  historyControl,
  protectionControl,
}: {
  defaultMode: VaultViewMode
  overViewControl: JSX.Element
  heading: JSX.Element
  headerControl: JSX.Element
  historyControl?: JSX.Element
  protectionControl?: JSX.Element
}): JSX.Element {
  const [mode, setMode] = useState<VaultViewMode>(defaultMode)
  const { uiChanges } = useAppContext()

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<TabChange>(TAB_CHANGE_SUBJECT)
    const subscription = uiChanges$.subscribe((value) => {
      setMode(value.currentMode)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  function getVariant(currentMode: VaultViewMode, activeMode: VaultViewMode) {
    return currentMode === activeMode ? 'tab' : 'tabInactive'
  }

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <Flex mt={2} mb={3} sx={{ zIndex: 0 }}>
        <Heading
          as="h1"
          variant="heading1"
          sx={{
            fontWeight: 'semiBold',
            pb: 2,
          }}
        >
          {heading}
        </Heading>
      </Flex>
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
        {headerControl}
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
