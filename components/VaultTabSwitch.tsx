import { Box, Button, Grid } from '@theme-ui/components'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
} from 'features/automation/protection/common/UITypes/TabChange'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactSelect, { OptionProps, SingleValueProps, ValueType } from 'react-select'
import { Flex } from 'theme-ui'

import { useFeatureToggle } from '../helpers/useFeatureToggle'
import { useHash } from '../helpers/useHash'
import { useAppContext } from './AppContextProvider'
import { reactSelectCustomComponents } from './reactSelectCustomComponents'
import { VaultTabTag } from './vault/VaultTabTag'

export enum VaultViewMode {
  Overview = 'Overview',
  Protection = 'Protection',
  Optimization = 'Optimization',
  History = 'History',
  VaultInfo = 'VaultInfo',
}

const InputWithTag = ({ data }: SingleValueProps<VaultTabSwitchOption>) => {
  return (
    <Flex sx={{ alignItems: 'center' }}>
      {(data as VaultTabSwitchOption).label}
      {(data as VaultTabSwitchOptionNewComponentDesignEnabled).withTag && (
        <VaultTabTag
          isEnabled={(data as VaultTabSwitchOptionNewComponentDesignEnabled).isTagEnabled}
        />
      )}
    </Flex>
  )
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
      <Flex sx={{ fontWeight: isSelected ? 'semiBold' : 'body', alignItems: 'center' }}>
        {data.label}
        {data.withTag && <VaultTabTag isEnabled={data.isTagEnabled} />}
      </Flex>
    </Box>
  )
}

type VaultTabSwitchOption = {
  value: VaultViewMode
  label: keyof typeof VaultViewMode
}

type VaultTabSwitchOptionNewComponentDesignEnabled = {
  value: VaultViewMode
  label: keyof typeof VaultViewMode
  withTag: boolean
  isTagEnabled?: boolean
}

export function VaultTabSwitch({
  defaultMode,
  headline,
  headerControl,
  overViewControl,
  historyControl,
  protectionControl,
  optimizationControl,
  vaultInfo,
  showProtectionTab,
  protectionEnabled,
}: {
  defaultMode: VaultViewMode
  overViewControl: JSX.Element
  heading: JSX.Element
  headline: JSX.Element
  headerControl: JSX.Element
  historyControl: JSX.Element
  protectionControl: JSX.Element
  optimizationControl: JSX.Element
  vaultInfo: JSX.Element
  showProtectionTab: boolean
  protectionEnabled: boolean
}): JSX.Element {
  const [hash, setHash] = useHash<VaultViewMode>()
  const [mode, setMode] = useState<VaultViewMode>(hash || defaultMode)
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const basicBSEnabled = useFeatureToggle('BasicBS')

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<TabChange>(TAB_CHANGE_SUBJECT)
    const subscription = uiChanges$.subscribe((value) => {
      setMode(value.currentMode)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setHash(mode)
  }, [mode])

  function getVariant(currentMode: VaultViewMode, activeMode: VaultViewMode) {
    return currentMode === activeMode ? 'vaultTabActive' : 'vaultTab'
  }

  const vaultViewModeTuples = Object.entries(VaultViewMode).filter(([entry]) => {
    switch (entry) {
      case 'Protection':
        return showProtectionTab
      case 'Optimization':
        return basicBSEnabled
      default:
        return true
    }
  })

  const options = useMemo(() => {
    const tagMap = {
      [VaultViewMode.Protection]: protectionEnabled,
      [VaultViewMode.Optimization]: false,
    } as Record<VaultViewMode, boolean>

    return vaultViewModeTuples.map(([label, value]) => ({
      value,
      label: t(`system.${label.toLowerCase()}`),
      withTag: Object.keys(tagMap).includes(value.toString()),
      isTagEnabled: tagMap[value as VaultViewMode],
    })) as VaultTabSwitchOptionNewComponentDesignEnabled[]
  }, [])

  const value = useMemo(
    () => options.find((option) => option.value === mode) as VaultTabSwitchOption,
    [mode],
  )

  const handleSelectChange = useCallback((option: ValueType<VaultTabSwitchOption>) => {
    setMode((option as VaultTabSwitchOption).value)
  }, [])

  const selectComponents = useMemo(() => reactSelectCustomComponents<VaultTabSwitchOption>(), [])

  return (
    <Grid gap={0} sx={{ width: '100%', mt: 4 }}>
      <Box sx={{ zIndex: 0 }}>{headline}</Box>

      <Box sx={{ display: ['block', 'none'], mb: 3 }}>
        <ReactSelect<VaultTabSwitchOption>
          options={options}
          onChange={handleSelectChange}
          components={{ ...selectComponents, Option, SingleValue: InputWithTag }}
          value={value}
          isOptionSelected={(option) => option.value === mode}
          isSearchable={false}
        />
      </Box>
      <Box sx={{ display: ['none', 'block'], zIndex: 1 }}>
        <Flex
          sx={{
            borderBottom: '3px solid',
            borderColor: 'rgba(37, 39, 61, 0.1)',
            width: '100%',
            mb: 4,
          }}
        >
          <Button
            onClick={() => setMode(VaultViewMode.Overview)}
            variant={getVariant(mode, VaultViewMode.Overview)}
          >
            {t('system.overview')}
          </Button>
          {showProtectionTab && (
            <Button
              onClick={() => setMode(VaultViewMode.Protection)}
              variant={getVariant(mode, VaultViewMode.Protection)}
            >
              {t('system.protection')}
              <VaultTabTag isEnabled={protectionEnabled} />
            </Button>
          )}
          {basicBSEnabled && (
            <Button
              onClick={() => setMode(VaultViewMode.Optimization)}
              variant={getVariant(mode, VaultViewMode.Optimization)}
            >
              {t('system.optimization')}
              <VaultTabTag isEnabled={false} />
            </Button>
          )}
          <Button
            onClick={() => setMode(VaultViewMode.VaultInfo)}
            variant={getVariant(mode, VaultViewMode.VaultInfo)}
          >
            {t('system.vaultinfo')}
          </Button>
          <Button
            onClick={() => setMode(VaultViewMode.History)}
            variant={getVariant(mode, VaultViewMode.History)}
          >
            {t('system.history')}
          </Button>
        </Flex>
      </Box>
      <Box sx={{ zIndex: 1 }}>
        {headerControl}
        {
          {
            Overview: overViewControl,
            Protection: protectionControl,
            Optimization: optimizationControl,
            History: historyControl,
            VaultInfo: vaultInfo,
          }[mode]
        }
      </Box>
    </Grid>
  )
}
