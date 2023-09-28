import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { TabBar } from 'components/TabBar'
import { GeneralManageVaultViewAutomation } from 'features/generalManageVault/GeneralManageVaultView'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange.constants'
import type { TabChange } from 'features/generalManageVault/TabChange.types'
import { uiChanges } from 'helpers/uiChanges'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

import type { GeneralManageTabBarProps } from './GeneralManageTabBar.types'
import { VaultViewMode } from './GeneralManageTabBar.types'
import { HistoryControl } from './HistoryControl'
import { OptimizationControl } from './OptimizationControl'
import { ProtectionControl } from './ProtectionControl'
import { VaultInformationControl } from './VaultInformationControl'

export function GeneralManageTabBar({
  generalManageVault,
  positionInfo,
  showAutomationTabs,
}: GeneralManageTabBarProps): JSX.Element {
  const { vault, vaultHistory } = generalManageVault.state
  const [hash] = useHash()
  const initialMode = Object.values<string>(VaultViewMode).includes(hash)
    ? (hash as VaultViewMode)
    : VaultViewMode.Overview
  const [mode, setMode] = useState<VaultViewMode>(initialMode)
  const { t } = useTranslation()

  const {
    triggerData: {
      autoBuyTriggerData,
      autoSellTriggerData,
      autoTakeProfitTriggerData,
      constantMultipleTriggerData,
      stopLossTriggerData,
    },
  } = useAutomationContext()

  const protectionEnabled =
    stopLossTriggerData.isStopLossEnabled || autoSellTriggerData.isTriggerEnabled
  const optimizationEnabled =
    autoBuyTriggerData.isTriggerEnabled ||
    constantMultipleTriggerData.isTriggerEnabled ||
    autoTakeProfitTriggerData.isTriggerEnabled

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<TabChange>(TAB_CHANGE_SUBJECT)
    const subscription = uiChanges$.subscribe((value) => {
      setMode(() => value.currentMode as VaultViewMode)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const analyticsAdditionalParams = {
    vaultId: vault.id.toString(),
    ilk: vault.ilk,
  }

  return (
    <TabBar
      variant="underline"
      useDropdownOnMobile
      sections={[
        {
          label: t('system.overview'),
          value: VaultViewMode.Overview,
          content: <GeneralManageVaultViewAutomation generalManageVault={generalManageVault} />,
        },
        ...(showAutomationTabs
          ? [
              {
                label: t('system.protection'),
                value: 'protection',
                tag: { include: true, active: protectionEnabled },
                content: <ProtectionControl />,
                callback: () => {
                  trackingEvents.automation.buttonClick(
                    MixpanelAutomationEventIds.SelectProtection,
                    MixpanelPages.VaultsOverview,
                    MixpanelCommonAnalyticsSections.HeaderTabs,
                    analyticsAdditionalParams,
                  )
                },
              },
              {
                label: t('system.optimization'),
                value: VaultViewMode.Optimization,
                tag: { include: true, active: optimizationEnabled },
                content: <OptimizationControl vaultHistory={vaultHistory} />,
                callback: () => {
                  trackingEvents.automation.buttonClick(
                    MixpanelAutomationEventIds.SelectOptimization,
                    MixpanelPages.VaultsOverview,
                    MixpanelCommonAnalyticsSections.HeaderTabs,
                    analyticsAdditionalParams,
                  )
                },
              },
            ]
          : []),
        {
          label: t('system.vaultinfo'),
          value: VaultViewMode.VaultInfo,
          content: <VaultInformationControl generalManageVault={generalManageVault} />,
        },
        ...(positionInfo
          ? [
              {
                label: t('system.position-info'),
                value: VaultViewMode.PositionInfo,
                content: positionInfo,
              },
            ]
          : []),
        {
          label: t('system.history'),
          value: VaultViewMode.History,
          content: <HistoryControl vaultHistory={vaultHistory} />,
        },
      ]}
      switchEvent={{ value: mode }}
    />
  )
}
