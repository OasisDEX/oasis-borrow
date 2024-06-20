import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { RaysSidebarBanner } from 'components/RaysSidebarBanner'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import type {
  OmniSidebarBorrowPanel,
  OmniSidebarEarnPanel,
  OmniSimulationSwap,
} from 'features/omni-kit/types'
import { OmniMultiplyPanel, OmniProductType } from 'features/omni-kit/types'
import { RAYS_OPTIMIZATION_BOOST, RAYS_PROTECTION_BOOST } from 'features/rays/consts'
import { getAutomationBoost } from 'features/rays/getAutomationBoost'
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
  swapData,
  hidden,
  protocol,
  collateralPrice,
  isYieldLoop,
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
  swapData?: OmniSimulationSwap
  hidden: boolean
  protocol: LendingProtocol
  collateralPrice: BigNumber
  isYieldLoop: boolean
}) => {
  const [, setHash] = useHash<string>()
  const { t } = useTranslation()

  if (hidden) {
    return null
  }
  const protocolBoost = getProtocolBoost(positionRaysMultipliersData)
  const swapBoost = getSwapBoost(positionRaysMultipliersData)
  const automationBoost = getAutomationBoost(positionRaysMultipliersData)

  // In general all positions should have `netValue` field since all positions extend either Lending or Supply interface
  const positionNetValue = position && 'netValue' in position ? position.netValue.toNumber() : 0
  const simulationNetValue =
    simulation && 'netValue' in simulation ? simulation.netValue.toNumber() : 0

  const raysPerYear = getPointsPerYear(positionNetValue)
  const newRaysPerYear = getPointsPerYear(simulationNetValue)

  const raysPerYearWithProtocolBoost = raysPerYear * protocolBoost
  const newRaysPerYearWithProtocolBoost = newRaysPerYear * protocolBoost

  if (isOpening) {
    const simulatedBaseRaysPerYear = getPointsPerYear(simulationNetValue)

    if (simulatedBaseRaysPerYear === 0) {
      return null
    }

    // if user already have position on currently used protocol, use current protocol boost
    const raysPerYear = positionRaysMultipliersData.allUserProtocols.includes(protocol)
      ? simulatedBaseRaysPerYear * protocolBoost
      : simulatedBaseRaysPerYear * getRaysNextProtocolBonus(protocolBoost, simulationNetValue)

    let rays

    if (swapData?.minToTokenAmount) {
      rays = formatCryptoBalance(swapData.minToTokenAmount.times(swapBoost))
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

  // OmniMultiplyPanel.Close and OmniBorrowPanel.Close are the same
  if (uiDropdown === OmniMultiplyPanel.Close) {
    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.closing.title', {
          rays: formatCryptoBalance(new BigNumber(raysPerYearWithProtocolBoost)),
        })}
        description={t('rays.sidebar.banner.closing.description', {
          raysPerYear: formatCryptoBalance(new BigNumber(raysPerYearWithProtocolBoost)),
        })}
        // daysLeft="2"
      />
    )
  }

  if (swapData) {
    const castedPosition = position as LendingPosition
    const castedSimulation = simulation as LendingPosition | undefined

    const withBuyingCollateral = castedSimulation?.riskRatio.loanToValue.gt(
      castedPosition.riskRatio.loanToValue,
    )

    const swapValue = (
      withBuyingCollateral ? swapData.minToTokenAmount : swapData.fromTokenAmount
    ).times(collateralPrice)

    const swapRaysPerYear = new BigNumber(getPointsPerYear(swapValue.toNumber()))
    const multiplyMultipliers = isYieldLoop ? 0.06 : 0.2

    const instantRays = formatCryptoBalance(
      swapRaysPerYear.times(swapBoost).times(multiplyMultipliers),
    )

    return (
      <RaysSidebarBanner title={t(`rays.sidebar.banner.instant.title`, { rays: instantRays })} />
    )
  }

  if (simulation && positionNetValue < simulationNetValue) {
    const rays = new BigNumber(
      newRaysPerYearWithProtocolBoost - raysPerYearWithProtocolBoost,
    ).times(automationBoost)

    return (
      <RaysSidebarBanner
        title={t(`rays.sidebar.banner.increase.title`, { rays: formatCryptoBalance(rays) })}
      />
    )
  }

  if (simulation && positionNetValue > simulationNetValue) {
    const rays = new BigNumber(
      raysPerYearWithProtocolBoost - newRaysPerYearWithProtocolBoost,
    ).times(automationBoost)

    return (
      <RaysSidebarBanner
        title={t(`rays.sidebar.banner.reduce.title`, { rays: formatCryptoBalance(rays) })}
      />
    )
  }

  if ((isSupportingOptimization || isSupportingProtection) && !swapData) {
    const castedPosition = position as LendingPosition

    if (castedPosition.debtAmount.isZero()) {
      return null
    }

    let extraRays = 0

    if (isOptimizationActive && isProtectionActive) {
      // no extra rays for adding more triggers
      return null
    }

    if (!isOptimizationActive && !isProtectionActive) {
      extraRays =
        raysPerYearWithProtocolBoost * RAYS_OPTIMIZATION_BOOST * RAYS_PROTECTION_BOOST -
        raysPerYearWithProtocolBoost
    }

    if (isOptimizationActive && !isProtectionActive) {
      const baseRays = raysPerYearWithProtocolBoost * RAYS_OPTIMIZATION_BOOST
      extraRays = baseRays * RAYS_PROTECTION_BOOST - baseRays
    }

    if (!isOptimizationActive && isProtectionActive) {
      const baseRays = raysPerYearWithProtocolBoost * RAYS_PROTECTION_BOOST
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
