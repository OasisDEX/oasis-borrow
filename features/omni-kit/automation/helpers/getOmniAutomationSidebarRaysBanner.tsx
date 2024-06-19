import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { RaysSidebarBanner } from 'components/RaysSidebarBanner'
import type { AutomationFeatures } from 'features/automation/common/types'
import { getIsLastAutomationOfKind } from 'features/omni-kit/automation/helpers/getIsLastAutomationOfKind'
import type { AutomationMetadataFlags } from 'features/omni-kit/types'
import { RAYS_OPTIMIZATION_BOOST, RAYS_PROTECTION_BOOST } from 'features/rays/consts'
import { getProtocolBoost } from 'features/rays/getProtocolBoost'
import { type PositionRaysMultipliersData } from 'features/rays/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { isAnyValueDefined } from 'helpers/isAnyValueDefined'
import { TriggerAction } from 'helpers/lambda/triggers'
import { getPointsPerYear } from 'helpers/rays'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const getOmniAutomationSidebarRaysBanner = ({
  activeTriggersNumber,
  action,
  positionRaysMultipliersData,
  position,
  automationFlags,
  automationFeature,
  hidden,
}: {
  activeTriggersNumber: number
  action: TriggerAction
  positionRaysMultipliersData: PositionRaysMultipliersData
  position: LendingPosition | SupplyPosition
  automationFlags?: AutomationMetadataFlags
  automationFeature: AutomationFeatures
  hidden: boolean
}) => {
  const { t } = useTranslation()

  if (!automationFlags || hidden) {
    return null
  }
  const {
    isAutoBuyEnabled,
    isPartialTakeProfitEnabled,
    isAutoSellEnabled,
    isTrailingStopLossEnabled,
    isStopLossEnabled,
  } = automationFlags

  const isActiveOptimization = isAnyValueDefined(isAutoBuyEnabled, isPartialTakeProfitEnabled)
  const isActiveProtection = isAnyValueDefined(
    isAutoSellEnabled,
    isTrailingStopLossEnabled,
    isStopLossEnabled,
  )
  const protocolBoost = getProtocolBoost(positionRaysMultipliersData)

  // In general all positions should have `netValue` field since all positions extend either Lending or Supply interface
  const raysPerYear = 'netValue' in position ? getPointsPerYear(position.netValue.toNumber()) : 0

  const stackedRaysPerYear = raysPerYear * protocolBoost

  if (activeTriggersNumber === 0) {
    const extraRays =
      stackedRaysPerYear * RAYS_OPTIMIZATION_BOOST * RAYS_PROTECTION_BOOST - stackedRaysPerYear

    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.boost.title', {
          rays: formatCryptoBalance(new BigNumber(extraRays)),
        })}
        description={t('rays.sidebar.banner.boost.description')}
      />
    )
  }

  if ([TriggerAction.Add, TriggerAction.Update].includes(action)) {
    return <RaysSidebarBanner title={t('rays.sidebar.banner.auto-ongoing.title')} />
  }

  if (action === TriggerAction.Remove) {
    let rays = 0

    const { isLastOptimization, isLastProtection } = getIsLastAutomationOfKind({
      automationFlags,
      automationFeature,
      action,
    })

    if (isLastOptimization && isActiveProtection) {
      const baseRays = stackedRaysPerYear * RAYS_PROTECTION_BOOST * RAYS_OPTIMIZATION_BOOST
      rays = baseRays - stackedRaysPerYear * RAYS_PROTECTION_BOOST
    }

    if (isLastProtection && isActiveOptimization) {
      const baseRays = stackedRaysPerYear * RAYS_PROTECTION_BOOST * RAYS_OPTIMIZATION_BOOST
      rays = baseRays - stackedRaysPerYear * RAYS_OPTIMIZATION_BOOST
    }

    if (isLastOptimization && !isActiveProtection) {
      const baseRays = stackedRaysPerYear * RAYS_OPTIMIZATION_BOOST
      rays = baseRays - stackedRaysPerYear
    }

    if (isLastProtection && !isActiveOptimization) {
      const baseRays = stackedRaysPerYear * RAYS_PROTECTION_BOOST
      rays = baseRays - stackedRaysPerYear
    }

    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.reduceAuto.title', {
          rays: formatCryptoBalance(new BigNumber(rays)),
        })}
        description={t('rays.sidebar.banner.reduceAuto.description')}
      />
    )
  }

  return null
}
