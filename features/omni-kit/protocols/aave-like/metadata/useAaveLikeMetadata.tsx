import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AaveLiquidatedNotice } from 'features/notices/VaultsNoticesView'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  getOmniBorrowishChangeVariant,
  getOmniBorrowPaybackMax,
  getOmniIsFormEmpty,
  getOmniIsFormEmptyStateGuard,
} from 'features/omni-kit/helpers'
import { useYieldLoopHeadlineDetails } from 'features/omni-kit/hooks/useMorphoYieldLoopHeadlineDetails'
import {
  AaveLikeDetailsSectionContent,
  AaveLikeDetailsSectionFooter,
} from 'features/omni-kit/protocols/aave-like/components'
import {
  aaveLikeFlowStateFilter,
  getAaveLikeAutomationMetadataValues,
  getAaveLikeBanner,
  getAaveLikeFaq,
  getAaveLikeFeatureToggle,
  getAaveLikeNotifications,
} from 'features/omni-kit/protocols/aave-like/helpers'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import type { GetOmniMetadata, LendingMetadata } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { useHash } from 'helpers/useHash'
import { zero } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import React from 'react'

export const useAaveLikeMetadata: GetOmniMetadata = (productContext) => {
  const {
    environment: {
      collateralAddress,
      collateralToken,
      isOpening,
      isOracless,
      isOwner,
      isYieldLoopWithData,
      networkId,
      pairId,
      priceFormat,
      productType,
      protocol,
      quoteAddress,
      quoteBalance,
      quoteToken,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()
  const [hash] = useHash()

  const featureToggles = getAaveLikeFeatureToggle(protocol)

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: featureToggles.safetySwitch,
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel[protocol],
  })

  const notifications: DetailsSectionNotificationItem[] = getAaveLikeNotifications({
    productType,
    auction: productContext.position.positionAuction as AaveLikeHistoryEvent,
    triggers: productContext.automation.positionTriggers,
    priceFormat,
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

      const { headlineDetails, isLoading: isHeadlineDetailsLoading } = useYieldLoopHeadlineDetails({
        maxRiskRatio: position.maxRiskRatio.loanToValue,
      })

      return {
        notifications,
        validations,
        filters: {
          omniProxyFilter: ({ event, filterConsumed }) =>
            aaveLikeFlowStateFilter({
              collateralAddress,
              event,
              filterConsumed,
              networkId,
              pairId,
              productType,
              protocol,
              quoteAddress,
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
          footerColumns: isYieldLoopWithData ? 3 : 2,
          maxSliderAsMaxLtv: true,
          headlineDetails,
          isHeadlineDetailsLoading,
          automation: getAaveLikeAutomationMetadataValues({
            positionTriggers: productContext.automation.positionTriggers,
            simulationResponse: productContext.automation.simulationData,
            commonFormState: productContext.automation.commonForm.state,
            automationForms: productContext.automation.automationForms,
            hash,
          }),
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
          positionBanner: productContext.position.positionAuction ? (
            <AaveLiquidatedNotice isPositionController={isOwner} />
          ) : undefined,
          overviewWithSimulation: isYieldLoopWithData,
        },
        featureToggles,
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error(`${protocol} does not support Earn`)
  }
}
