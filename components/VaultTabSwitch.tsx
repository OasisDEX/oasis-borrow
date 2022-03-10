import { Box, Button, Grid } from '@theme-ui/components'
import { TAB_CHANGE_SUBJECT, TabChange } from 'features/automation/common/UITypes/TabChange'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Flex, Heading } from 'theme-ui'

import { useAppContext } from './AppContextProvider'

export enum VaultViewMode {
  History,
  Protection,
  Overview,
}

export function VaultTabSwitch({
  defaultMode,
  heading,
  headerControl,
  overViewControl,
  historyControl,
  protectionControl,
  showProtectionTab,
}: {
  defaultMode: VaultViewMode
  overViewControl: JSX.Element
  heading: JSX.Element
  headerControl: JSX.Element
  historyControl: JSX.Element
  protectionControl: JSX.Element
  showProtectionTab: boolean
}): JSX.Element {
  const [mode, setMode] = useState<VaultViewMode>(defaultMode)
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()

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

  const buttonSx = { flex: 1, px: 4 }

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
      <Flex
        sx={{
          zIndex: 1,
          maxWidth: 'fit-content',
          backgroundColor: 'fadedWhite',
          bg: 'backgroundAlt',
          borderRadius: '60px',
        }}
        variant="vaultEditingControllerContainer"
      >
        <Button
          onClick={() => setMode(VaultViewMode.Overview)}
          variant={getVariant(mode, VaultViewMode.Overview)}
          sx={buttonSx}
        >
          {t('system.overview')}
        </Button>
        {showProtectionTab && (
          <Button
            onClick={() => setMode(VaultViewMode.Protection)}
            variant={getVariant(mode, VaultViewMode.Protection)}
            sx={buttonSx}
          >
            {t('system.protection')}
          </Button>
        )}
        <Button
          onClick={() => setMode(VaultViewMode.History)}
          variant={getVariant(mode, VaultViewMode.History)}
          sx={buttonSx}
        >
          {t('system.history')}
        </Button>
      </Flex>
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
