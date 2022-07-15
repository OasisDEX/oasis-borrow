import { useAppContext } from 'components/AppContextProvider'
import { TabBar } from 'components/TabBar'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
} from 'features/automation/protection/common/UITypes/TabChange'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { GeneralManageVaultViewAutomation } from 'features/generalManageVault/GeneralManageVaultView'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

import { HistoryControl } from './HistoryControl'
import { OptimizationControl } from './OptimizationControl'
import { ProtectionControl } from './ProtectionControl'
import { VaultInformationControl } from './VaultInformationControl'

export enum VaultViewMode {
  Overview = 'overview',
  Protection = 'protection',
  Optimization = 'optimization',
  History = 'history',
  PositionInfo = 'position-info',
  VaultInfo = 'vault-info',
}

interface GeneralManageTabBarProps {
  generalManageVault: GeneralManageVaultState
  positionInfo?: JSX.Element
  showAutomationTabs: boolean
  protectionEnabled: boolean
  optimizationEnabled: boolean
}

export function GeneralManageTabBar({
  generalManageVault,
  positionInfo,
  showAutomationTabs,
  protectionEnabled,
  optimizationEnabled,
}: GeneralManageTabBarProps): JSX.Element {
  const { ilkData, vault, account, balanceInfo, vaultHistory } = generalManageVault.state
  const [hash] = useHash()
  const initialMode = Object.values<string>(VaultViewMode).includes(hash)
    ? (hash as VaultViewMode)
    : VaultViewMode.Overview
  const [mode, setMode] = useState<VaultViewMode>(initialMode)
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const basicBSEnabled = useFeatureToggle('BasicBS')

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<TabChange>(TAB_CHANGE_SUBJECT)
    const subscription = uiChanges$.subscribe((value) => {
      setMode(() => value.currentMode as VaultViewMode)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
                content: (
                  <ProtectionControl
                    vault={vault}
                    ilkData={ilkData}
                    account={account}
                    balanceInfo={balanceInfo}
                  />
                ),
              },
            ]
          : []),
        ...(basicBSEnabled && showAutomationTabs
          ? [
              {
                label: t('system.optimization'),
                value: VaultViewMode.Optimization,
                tag: { include: true, active: optimizationEnabled },
                content: (
                  <OptimizationControl vault={vault} ilkData={ilkData} balanceInfo={balanceInfo} />
                ),
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
