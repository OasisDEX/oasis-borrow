import { useAppContext } from 'components/AppContextProvider'
import { TabBar } from 'components/TabBar'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
} from 'features/automation/protection/common/UITypes/TabChange'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { GeneralManageVaultViewAutomation } from 'features/generalManageVault/GeneralManageVaultView'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
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
  VaultInfo = 'vault-info',
}

interface GeneralManageTabBarProps {
  generalManageVault: GeneralManageVaultState
  showProtectionTab: boolean
  protectionEnabled: boolean
  optimizationEnabled: boolean
}

export function GeneralManageTabBar({
  generalManageVault,
  showProtectionTab,
  protectionEnabled,
  optimizationEnabled,
}: GeneralManageTabBarProps): JSX.Element {
  const { ilkData, vault, account, balanceInfo, vaultHistory } = generalManageVault.state

  const [mode, setMode] = useState<VaultViewMode>(VaultViewMode.Overview)
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const basicBSEnabled = useFeatureToggle('BasicBS')

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<TabChange>(TAB_CHANGE_SUBJECT)
    const subscription = uiChanges$.subscribe((value) => {
      setMode(() => value.currentMode)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <TabBar
      variant="underline"
      sections={[
        {
          label: t('system.overview'),
          value: 'overview',
          content: <GeneralManageVaultViewAutomation generalManageVault={generalManageVault} />,
        },
        ...(showProtectionTab
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
        ...(basicBSEnabled
          ? [
              {
                label: t('system.optimization'),
                value: 'optimization',
                tag: { include: true, active: optimizationEnabled },
                content: <OptimizationControl vault={vault} />,
              },
            ]
          : []),
        {
          label: t('system.vaultinfo'),
          value: 'vaultinfo',
          content: <VaultInformationControl generalManageVault={generalManageVault} />,
        },
        {
          label: t('system.history'),
          value: 'history',
          content: <HistoryControl vaultHistory={vaultHistory} />,
        },
      ]}
      switchEvent={{ value: mode }}
    />
  )
}
