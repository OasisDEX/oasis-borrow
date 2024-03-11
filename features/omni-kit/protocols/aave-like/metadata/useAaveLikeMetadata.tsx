import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { GetOmniMetadata, LendingMetadata } from 'features/omni-kit/contexts'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  getOmniBorrowishChangeVariant,
  getOmniBorrowPaybackMax,
  getOmniIsFormEmpty,
  getOmniIsFormEmptyStateGuard,
} from 'features/omni-kit/helpers'
import {
  AaveLikeDetailsSectionContent,
  AaveLikeDetailsSectionFooter,
} from 'features/omni-kit/protocols/aave-like/components'
import {
  aaveLikeFlowStateFilter,
  getAaveLikeBanner,
  getAaveLikeFaq,
  getAaveLikeFeatureToggle,
  getAaveLikeNotifications,
  getAaveLikeSidebarTitle,
} from 'features/omni-kit/protocols/aave-like/helpers'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import { useAaveLikeHeadlineDetails } from 'features/omni-kit/protocols/aave-like/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export const useAaveLikeMetadata: GetOmniMetadata = (productContext) => {
  const {
    environment: {
      collateralToken,
      collateralAddress,
      isOracless,
      productType,
      quoteAddress,
      quoteBalance,
      protocol,
      isYieldLoopWithData,
      isOpening,
      quoteToken,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const featureToggles = getAaveLikeFeatureToggle(protocol)

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: featureToggles.safetySwitch,
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel[protocol],
  })

  const notifications: DetailsSectionNotificationItem[] = getAaveLikeNotifications({
    productType,
    auction: productContext.position.positionAuction as AaveLikeHistoryEvent,
  })

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const position = productContext.position.currentPosition.position as AaveLikePositionV2
      const simulation = productContext.position.currentPosition.simulation as
        | AaveLikePositionV2
        | undefined
      const cachedSimulation = productContext.position.cachedPosition?.simulation as
        | AaveLikePositionV2
        | undefined
      const resolvedSimulation = simulation || cachedSimulation

      const { headlineDetails, isLoading: isHeadlineDetailsLoading } = useAaveLikeHeadlineDetails({
        maxRiskRatio: position.maxRiskRatio,
      })

      return {
        notifications,
        validations,
        filters: {
          flowStateFilter: (event: CreatePositionEvent) =>
            aaveLikeFlowStateFilter({
              collateralAddress,
              event,
              productType,
              quoteAddress,
              protocol,
            }),
        },
        values: {
          interestRate: position.borrowRate,
          isFormEmpty: getOmniIsFormEmpty({
            stateTypeWrapper: getOmniIsFormEmptyStateGuard({
              type: productType,
              state: productContext.form.state,
            }),
            currentStep,
            txStatus: txDetails?.txStatus,
          }),
          afterBuyingPower: simulation?.buyingPower,
          shouldShowDynamicLtv: () => false,
          debtMin: zero,
          debtMax: position.debtAvailable(),
          changeVariant: getOmniBorrowishChangeVariant({ simulation, isOracless }),
          afterAvailableToBorrow: simulation && simulation.debtAvailable(),
          afterPositionDebt: resolvedSimulation?.debtAmount,
          withdrawMax: position.collateralAvailable,
          paybackMax: getOmniBorrowPaybackMax({
            balance: quoteBalance,
            position,
          }),
          sidebarTitle: getAaveLikeSidebarTitle({
            currentStep,
            productType,
          }),
          footerColumns: isYieldLoopWithData ? 3 : 2,
          maxSliderAsMaxLtv: true,
          headlineDetails,
          isHeadlineDetailsLoading,
        },
        elements: {
          faq: getAaveLikeFaq({ productType, isYieldLoopWithData, protocol }),
          overviewContent: <AaveLikeDetailsSectionContent />,
          overviewFooter: <AaveLikeDetailsSectionFooter />,
          overviewBanner: getAaveLikeBanner({
            protocol,
            isYieldLoopWithData,
            collateralToken,
            quoteToken,
            isOpening,
          }),
          overviewWithSimulation: true,
        },
        featureToggles,
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error(`${protocol} does not support Earn`)
  }
}
