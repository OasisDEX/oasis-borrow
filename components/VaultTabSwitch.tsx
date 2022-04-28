import { Box, Button, Grid } from '@theme-ui/components'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
} from 'features/automation/protection/common/UITypes/TabChange'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import ReactSelect, { OptionProps, SingleValueProps, ValueType } from 'react-select'
import { Flex, Heading } from 'theme-ui'

import { useFeatureToggle } from '../helpers/useFeatureToggle'
import { fadeInAnimation } from '../theme/animations'
import { useAppContext } from './AppContextProvider'
import { reactSelectCustomComponents } from './reactSelectCustomComponents'
import { VaultTabTag } from './vault/VaultTabTag'

export enum VaultViewMode {
  Overview,
  Protection,
  History,
  VaultInfo,
}

interface VaultTabButtonProps {
  onClick: () => void
  variant: string
  children: ReactNode
}

function VaultTabButton({ onClick, variant, children }: VaultTabButtonProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Button onClick={onClick} variant={variant}>
        {children}
      </Button>
      {variant === 'vaultTab' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '-3px',
            borderBottom: '3px solid',
            borderColor: 'primary',
            width: '100%',
            ...fadeInAnimation,
          }}
        />
      )}
    </Box>
  )
}

const InputWithTag = ({ data }: SingleValueProps<VaultTabSwitchOption>) => {
  const automationBasicBuyAndSellEnabled = useFeatureToggle('AutomationBasicBuyAndSell')
  return (
    <Flex sx={{ alignItems: 'center' }}>
      {(data as VaultTabSwitchOption).label}
      {(data as VaultTabSwitchOptionAutomationBasicBuyAndSell).withTag &&
        automationBasicBuyAndSellEnabled && (
          <VaultTabTag
            isEnabled={(data as VaultTabSwitchOptionAutomationBasicBuyAndSell).isTagEnabled}
          />
        )}
    </Flex>
  )
}

function Option({ innerProps, isSelected, data }: OptionProps<VaultTabSwitchOption>) {
  const automationBasicBuyAndSellEnabled = useFeatureToggle('AutomationBasicBuyAndSell')

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
        {data.withTag && automationBasicBuyAndSellEnabled && (
          <VaultTabTag isEnabled={data.isTagEnabled} />
        )}
      </Flex>
    </Box>
  )
}

type VaultTabSwitchOption = {
  value: VaultViewMode
  label: keyof typeof VaultViewMode
}

type VaultTabSwitchOptionAutomationBasicBuyAndSell = {
  value: VaultViewMode
  label: keyof typeof VaultViewMode
  withTag: boolean
  isTagEnabled?: boolean
}

export function VaultTabSwitch({
  defaultMode,
  heading,
  headline,
  headerControl,
  overViewControl,
  historyControl,
  protectionControl,
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
  vaultInfo: JSX.Element
  showProtectionTab: boolean
  protectionEnabled: boolean
}): JSX.Element {
  const [mode, setMode] = useState<VaultViewMode>(defaultMode)
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const automationBasicBuyAndSellEnabled = useFeatureToggle('AutomationBasicBuyAndSell')

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
    if (automationBasicBuyAndSellEnabled) {
      return currentMode === activeMode ? 'vaultTab' : 'vaultTabInactive'
    }
    return currentMode === activeMode ? 'tab' : 'tabInactive'
  }

  const buttonSx = { flex: 1, px: 4 }

  const vaultViewModeEntries = Object.entries(VaultViewMode)
  const vaultViewModeTuples = vaultViewModeEntries.splice(
    -Math.ceil(vaultViewModeEntries.length / 2),
  )
  const options = useMemo(() => {
    const tagMap = {
      [VaultViewMode.Protection]: protectionEnabled,
    } as Record<VaultViewMode, boolean>

    return automationBasicBuyAndSellEnabled
      ? (vaultViewModeTuples.map(([label, value]) => ({
          value,
          label,
          withTag: Object.keys(tagMap).includes(value.toString()),
          isTagEnabled: tagMap[value as VaultViewMode],
        })) as VaultTabSwitchOptionAutomationBasicBuyAndSell[])
      : (vaultViewModeTuples.map(([label, value]) => ({
          value,
          label,
        })) as VaultTabSwitchOption[])
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
    <Grid gap={0} sx={{ width: '100%' }}>
      {automationBasicBuyAndSellEnabled ? (
        <Box sx={{ zIndex: 0 }}>{headline}</Box>
      ) : (
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
      )}
      <Box sx={{ display: ['block', 'none'] }}>
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
        {automationBasicBuyAndSellEnabled ? (
          <Flex
            sx={{
              borderBottom: '3px solid',
              borderColor: 'rgba(37, 39, 61, 0.1)',
              width: '100%',
              mb: 4,
            }}
          >
            <VaultTabButton
              onClick={() => setMode(VaultViewMode.Overview)}
              variant={getVariant(mode, VaultViewMode.Overview)}
            >
              {t('system.overview')}
            </VaultTabButton>
            {showProtectionTab && (
              <VaultTabButton
                onClick={() => setMode(VaultViewMode.Protection)}
                variant={getVariant(mode, VaultViewMode.Protection)}
              >
                {t('system.protection')}
                <VaultTabTag isEnabled={protectionEnabled} />
              </VaultTabButton>
            )}
            <VaultTabButton
              onClick={() => setMode(VaultViewMode.VaultInfo)}
              variant={getVariant(mode, VaultViewMode.VaultInfo)}
            >
              {t('system.vault-info')}
            </VaultTabButton>
            <VaultTabButton
              onClick={() => setMode(VaultViewMode.History)}
              variant={getVariant(mode, VaultViewMode.History)}
            >
              {t('system.history')}
            </VaultTabButton>
          </Flex>
        ) : (
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
        )}
      </Box>
      <Box sx={{ zIndex: 1 }}>
        {headerControl}
        {mode === VaultViewMode.Overview
          ? overViewControl
          : mode === VaultViewMode.Protection
          ? protectionControl
          : mode === VaultViewMode.History
          ? historyControl
          : vaultInfo}
      </Box>
    </Grid>
  )
}
