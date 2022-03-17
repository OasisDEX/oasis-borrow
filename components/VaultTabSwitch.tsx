import { Box, Button, Grid } from '@theme-ui/components'
import { TAB_CHANGE_SUBJECT, TabChange } from 'features/automation/common/UITypes/TabChange'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactSelect, { OptionProps, ValueType } from 'react-select'
import { Flex, Heading } from 'theme-ui'

import { useAppContext } from './AppContextProvider'
import { reactSelectCustomComponents } from './reactSelectCustomComponents'

export enum VaultViewMode {
  Overview,
  Protection,
  History,
}

type VaultTabSwitchOption = {
  value: VaultViewMode
  label: keyof typeof VaultViewMode
}

function Option({ innerProps, isSelected, data }: OptionProps<VaultTabSwitchOption>) {
  return (
    <Box
      {...innerProps}
      sx={{
        py: 2,
        px: 3,
        bg: isSelected ? 'selected' : undefined,
        cursor: 'pointer',
        '&:hover': {
          bg: 'secondaryAlt',
        },
      }}
    >
      <Flex sx={{ fontWeight: isSelected ? 'semiBold' : 'body' }}>{data.label}</Flex>
    </Box>
  )
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

  const vaultViewModeEntries = Object.entries(VaultViewMode)
  const vaultViewModeTuples = vaultViewModeEntries.splice(
    -Math.ceil(vaultViewModeEntries.length / 2),
  )
  const options = useMemo(
    () =>
      vaultViewModeTuples.map(([label, value]) => ({
        value,
        label,
      })) as VaultTabSwitchOption[],
    [],
  )

  const value = useMemo(
    () => options.find((option) => option.value === mode) as VaultTabSwitchOption,
    [mode],
  )

  const handleSelectChange = useCallback((option: ValueType<VaultTabSwitchOption>) => {
    setMode((option as VaultTabSwitchOption).value)
  }, [])

  const selectComponents = useMemo(() => reactSelectCustomComponents<VaultTabSwitchOption>(), [])

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
      <Box sx={{ display: ['block', 'none'] }}>
        <ReactSelect<VaultTabSwitchOption>
          options={options}
          onChange={handleSelectChange}
          components={{ ...selectComponents, Option }}
          value={value}
          isOptionSelected={(option) => option.value === mode}
          isSearchable={false}
        />
      </Box>
      <Box sx={{ display: ['none', 'block'], zIndex: 1 }}>
        <Flex
          sx={{
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
      </Box>
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
