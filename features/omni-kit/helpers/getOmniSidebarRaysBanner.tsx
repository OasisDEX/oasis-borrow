import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { RaysSidebarBanner } from 'components/RaysSidebarBanner'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import type { OmniSidebarBorrowPanel, OmniSidebarEarnPanel } from 'features/omni-kit/types'
import { OmniMultiplyPanel, OmniProductType } from 'features/omni-kit/types'
import { RAYS_OPTIMIZATION_BOOST, RAYS_PROTECTION_BOOST } from 'features/rays/consts'
import { getProtocolBoost } from 'features/rays/getProtocolBoost'
import { getRaysNextProtocolBonus } from 'features/rays/getRaysNextProtocolBonus'
import { getSwapBoost } from 'features/rays/getSwapBoost'
import type { PositionRaysMultipliersData } from 'features/rays/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { getPointsPerYear } from 'helpers/rays'
import { useHash } from 'helpers/useHash'
import type { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const getOmniSidebarRaysBanner = ({
  isOpening,
  uiDropdown,
  isSupportingOptimization,
  isOptimizationActive,
  isSupportingProtection,
  isProtectionActive,
  positionRaysMultipliersData,
  position,
  simulation,
  productType,
  openSwapValue,
  hidden,
  protocol,
}: {
  isOpening: boolean
  uiDropdown: OmniMultiplyPanel | OmniSidebarEarnPanel | OmniSidebarBorrowPanel
  isSupportingOptimization: boolean
  isOptimizationActive: boolean
  isSupportingProtection: boolean
  isProtectionActive: boolean
  positionRaysMultipliersData: PositionRaysMultipliersData
  position: LendingPosition | SupplyPosition
  simulation?: LendingPosition | SupplyPosition
  productType: OmniProductType
  openSwapValue?: BigNumber
  hidden: boolean
  protocol: LendingProtocol
}) => {
  const [, setHash] = useHash<string>()
  const { t } = useTranslation()

  if (hidden) {
    return null
  }

  const protocolBoost = getProtocolBoost(positionRaysMultipliersData)
  const swapBoost = getSwapBoost(positionRaysMultipliersData)

  if (isOpening) {
    const simulatedBaseRaysPerYear =
      simulation && 'netValue' in simulation ? getPointsPerYear(simulation.netValue.toNumber()) : 0

    if (simulatedBaseRaysPerYear === 0) {
      return null
    }

    // if user already have position on currently used protocol, use current protocol boost
    const raysPerYear = positionRaysMultipliersData.allUserProtocols.includes(protocol)
      ? simulatedBaseRaysPerYear * protocolBoost
      : simulatedBaseRaysPerYear * getRaysNextProtocolBonus(protocolBoost)

    let rays

    if (openSwapValue) {
      rays = formatCryptoBalance(openSwapValue.times(swapBoost))
    } else {
      rays = 'n/a'
    }

    return (
      <RaysSidebarBanner
        title={t(
          `rays.sidebar.banner.${productType === OmniProductType.Multiply ? 'instant' : 'open-non-swap'}.title`,
          { rays },
        )}
        description={t('rays.sidebar.banner.instant.description', {
          raysPerYear: formatCryptoBalance(new BigNumber(raysPerYear)),
        })}
      />
    )
  }

  // In general all positions should have `netValue` field since all positions extend either Lending or Supply interface
  const raysPerYear = 'netValue' in position ? getPointsPerYear(position.netValue.toNumber()) : 0

  const stackedRaysPerYear = raysPerYear * protocolBoost

  // OmniMultiplyPanel.Close and OmniBorrowPanel.Close are the same
  if (uiDropdown === OmniMultiplyPanel.Close) {
    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.closing.title', { rays: 'n/a' })}
        description={t('rays.sidebar.banner.closing.description', {
          raysPerYear: formatCryptoBalance(new BigNumber(stackedRaysPerYear)),
        })}
        daysLeft="2"
      />
    )
  }

  if (isSupportingOptimization || isSupportingProtection) {
    let extraRays = 0

    if (isOptimizationActive && isProtectionActive) {
      // no extra rays for adding more triggers
      return null
    }

    if (!isOptimizationActive && !isProtectionActive) {
      extraRays =
        stackedRaysPerYear * RAYS_OPTIMIZATION_BOOST * RAYS_PROTECTION_BOOST - stackedRaysPerYear
    }

    if (isOptimizationActive && !isProtectionActive) {
      const baseRays = stackedRaysPerYear * RAYS_OPTIMIZATION_BOOST
      extraRays = baseRays * RAYS_PROTECTION_BOOST - baseRays
    }

    if (!isOptimizationActive && isProtectionActive) {
      const baseRays = stackedRaysPerYear * RAYS_PROTECTION_BOOST
      extraRays = baseRays * RAYS_OPTIMIZATION_BOOST - baseRays
    }

    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.boost.title', {
          rays: formatCryptoBalance(new BigNumber(extraRays)),
        })}
        items={[
          ...(!isProtectionActive
            ? [
                { title: 'Stop Loss →', action: () => setHash(VaultViewMode.Protection) },
                { title: 'Auto Sell →', action: () => setHash(VaultViewMode.Protection) },
              ]
            : []),
          ...(!isOptimizationActive
            ? [
                { title: 'Take Profit →', action: () => setHash(VaultViewMode.Optimization) },
                { title: 'Auto Buy →', action: () => setHash(VaultViewMode.Optimization) },
              ]
            : []),
        ]}
      />
    )
  }

  return null
}
