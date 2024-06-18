import { RaysSidebarBanner } from 'components/RaysSidebarBanner'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import type { OmniSidebarBorrowPanel, OmniSidebarEarnPanel } from 'features/omni-kit/types'
import { OmniMultiplyPanel } from 'features/omni-kit/types'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const getOmniSidebarRaysBanner = ({
  isOpening,
  uiDropdown,
  isSupportingOptimization,
  isSupportingProtection,
}: {
  isOpening: boolean
  uiDropdown: OmniMultiplyPanel | OmniSidebarEarnPanel | OmniSidebarBorrowPanel
  isSupportingOptimization: boolean
  isSupportingProtection: boolean
}) => {
  const [, setHash] = useHash<string>()
  const { t } = useTranslation()

  if (isOpening) {
    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.instant.title', { rays: '12345' })}
        description={t('rays.sidebar.banner.instant.description', { raysPerYear: '12345' })}
      />
    )
  }

  // OmniMultiplyPanel.Close and OmniBorrowPanel.Close are the same
  if (uiDropdown === OmniMultiplyPanel.Close) {
    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.closing.title', { rays: '12345' })}
        description={t('rays.sidebar.banner.closing.description', { raysPerYear: '12345' })}
        daysLeft="2"
      />
    )
  }

  if (isSupportingOptimization || isSupportingProtection) {
    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.boost.title', { rays: '12345' })}
        items={[
          { title: 'Stop Loss →', action: () => setHash(VaultViewMode.Protection) },
          { title: 'Auto Sell →', action: () => setHash(VaultViewMode.Protection) },
          { title: 'Take Profit →', action: () => setHash(VaultViewMode.Optimization) },
          { title: 'Auto Buy →', action: () => setHash(VaultViewMode.Optimization) },
        ]}
      />
    )
  }

  return null
}
