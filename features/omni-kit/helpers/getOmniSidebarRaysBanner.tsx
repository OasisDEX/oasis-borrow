import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { RaysSidebarBanner } from 'components/RaysSidebarBanner'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
import type {
  OmniMultiplyPanel,
  OmniSidebarBorrowPanel,
  OmniSidebarEarnPanel,
  OmniSimulationSwap,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { RAYS_OPTIMIZATION_BOOST, RAYS_PROTECTION_BOOST } from 'features/rays/consts'
import { getAutomationBoost } from 'features/rays/getAutomationBoost'
import { getProtocolBoost } from 'features/rays/getProtocolBoost'
import { getRaysMultiplyMultipliers } from 'features/rays/getRaysMultiplyMultipliers'
import { getRaysNextProtocolBonus } from 'features/rays/getRaysNextProtocolBonus'
import { getSwapBoost } from 'features/rays/getSwapBoost'
import { getTimeOpenBoost } from 'features/rays/getTimeOpenBoost'
import type { PositionRaysMultipliersData } from 'features/rays/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { getPointsPerYear } from 'helpers/rays'
import { useHash } from 'helpers/useHash'
import { one } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const getOmniSidebarRaysBanner = ({
  isOpening,
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
  pseudoProtocol,
  collateralPrice,
  isYieldLoop,
  temporaryRaysMultiplier = one,
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
  pseudoProtocol?: string
  collateralPrice: BigNumber
  isYieldLoop: boolean
  temporaryRaysMultiplier?: BigNumber
}) => {
  const [, setHash] = useHash<string>()
  const { t } = useTranslation()

  if (hidden) {
    return null
  }
  const protocolBoost = getProtocolBoost(positionRaysMultipliersData)
  const swapBoost = getSwapBoost(positionRaysMultipliersData)
  const automationBoost = getAutomationBoost(positionRaysMultipliersData)
  const timeOpenBoost = getTimeOpenBoost(positionRaysMultipliersData)

  // In general all positions should have `netValue` field since all positions extend either Lending or Supply interface
  const positionNetValue = position && 'netValue' in position ? position.netValue.toNumber() : 0
  const simulationNetValue =
    simulation && 'netValue' in simulation ? simulation.netValue.toNumber() : 0

  const raysPerYear = getPointsPerYear(positionNetValue)
  const newRaysPerYear = getPointsPerYear(simulationNetValue)

  const raysPerYearWithBasicBoosts = raysPerYear * protocolBoost * timeOpenBoost
  const newRaysPerYearWithBasicBoosts = newRaysPerYear * protocolBoost * timeOpenBoost

  if (isOpening) {
    const simulatedBaseRaysPerYear = getPointsPerYear(simulationNetValue)

    if (simulatedBaseRaysPerYear === 0) {
      return null
    }

    // if user already have position on currently used protocol, use current protocol boost
    const simulatedRaysPerYear = positionRaysMultipliersData.allUserProtocols.includes(protocol)
      ? simulatedBaseRaysPerYear * protocolBoost
      : simulatedBaseRaysPerYear * getRaysNextProtocolBonus(protocolBoost, simulationNetValue)

    let instantRays

    if (swapData?.minToTokenAmount) {
      const swapRaysPerYear = new BigNumber(
        getPointsPerYear(swapData.minToTokenAmount.times(collateralPrice).toNumber()),
      )
      const multiplyMultipliers = getRaysMultiplyMultipliers(isYieldLoop)

      instantRays = formatCryptoBalance(
        swapRaysPerYear.times(swapBoost).times(multiplyMultipliers).times(temporaryRaysMultiplier),
      )
    } else {
      instantRays = 'n/a'
    }

    return (
      <RaysSidebarBanner
        title={t(
          `rays.sidebar.banner.${productType === OmniProductType.Multiply || swapData ? 'instant' : 'open-non-swap'}.title`,
          { rays: instantRays },
        )}
        description={t('rays.sidebar.banner.instant.description', {
          raysPerYear: formatCryptoBalance(
            new BigNumber(simulatedRaysPerYear).times(temporaryRaysMultiplier),
          ),
        })}
      />
    )
  }

  // TODO provide proper handling based on position current earned points, days left etc.
  // OmniMultiplyPanel.Close and OmniBorrowPanel.Close are the same
  // if (uiDropdown === OmniMultiplyPanel.Close) {
  //   return (
  //     <RaysSidebarBanner
  //       title={t('rays.sidebar.banner.closing.title', {
  //         rays: formatCryptoBalance(new BigNumber(raysPerYearWithBasicBoosts)),
  //       })}
  //       description={t('rays.sidebar.banner.closing.description', {
  //         raysPerYear: formatCryptoBalance(new BigNumber(raysPerYearWithBasicBoosts)),
  //       })}
  //       // daysLeft="2"
  //     />
  //   )
  // }

  if (swapData) {
    const castedPosition = position as LendingPosition
    const castedSimulation = simulation as LendingPosition | undefined

    // handle pseudo protocol since we have a SupplyPositions that have optional swaps on deposit (Erc4626),
    // but doesn't have on withdraw (if at some point we will add support, much complex handling will be required)
    const withBuyingCollateral =
      pseudoProtocol === Erc4626PseudoProtocol
        ? true
        : castedSimulation?.riskRatio?.loanToValue.gt(castedPosition.riskRatio.loanToValue)

    const swapValue = (
      withBuyingCollateral ? swapData.minToTokenAmount : swapData.fromTokenAmount
    ).times(collateralPrice)

    const swapRaysPerYear = new BigNumber(getPointsPerYear(swapValue.toNumber()))
    const multiplyMultipliers = getRaysMultiplyMultipliers(isYieldLoop)

    const instantRays = swapRaysPerYear
      .times(swapBoost)
      .times(multiplyMultipliers)
      .times(temporaryRaysMultiplier)

    return (
      <RaysSidebarBanner
        title={t(`rays.sidebar.banner.instant.title`, { rays: formatCryptoBalance(instantRays) })}
      />
    )
  }

  if (simulation && positionNetValue < simulationNetValue) {
    const rays = new BigNumber(newRaysPerYearWithBasicBoosts - raysPerYearWithBasicBoosts)
      .times(automationBoost)
      .times(temporaryRaysMultiplier)

    return (
      <RaysSidebarBanner
        title={t(`rays.sidebar.banner.increase.title`, { rays: formatCryptoBalance(rays) })}
      />
    )
  }

  if (simulation && positionNetValue > simulationNetValue) {
    const rays = new BigNumber(raysPerYearWithBasicBoosts - newRaysPerYearWithBasicBoosts)
      .times(automationBoost)
      .times(temporaryRaysMultiplier)

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
        raysPerYearWithBasicBoosts * RAYS_OPTIMIZATION_BOOST * RAYS_PROTECTION_BOOST -
        raysPerYearWithBasicBoosts
    }

    if (isOptimizationActive && !isProtectionActive) {
      const baseRays = raysPerYearWithBasicBoosts * RAYS_OPTIMIZATION_BOOST
      extraRays = baseRays * RAYS_PROTECTION_BOOST - baseRays
    }

    if (!isOptimizationActive && isProtectionActive) {
      const baseRays = raysPerYearWithBasicBoosts * RAYS_PROTECTION_BOOST
      extraRays = baseRays * RAYS_OPTIMIZATION_BOOST - baseRays
    }

    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.boost.title', {
          rays: formatCryptoBalance(new BigNumber(extraRays).times(temporaryRaysMultiplier)),
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
