import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AaveLiquidatedNotice } from 'features/notices/VaultsNoticesView'
import { getAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  getOmniBorrowDebtMax,
  getOmniBorrowishChangeVariant,
  getOmniBorrowPaybackMax,
  getOmniIsFormEmpty,
  getOmniIsFormEmptyStateGuard,
} from 'features/omni-kit/helpers'
import { useOmniRefinanceBanner } from 'features/omni-kit/hooks/useOmniRefinanceBanner'
import { useYieldLoopHeadlineDetails } from 'features/omni-kit/hooks/useYieldLoopHeadlineDetails'
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
} from 'features/omni-kit/protocols/aave-like/helpers'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import type { GetOmniMetadata, LendingMetadata } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { useHash } from 'helpers/useHash'
import { zero } from 'helpers/zero'
import { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
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
      poolId,
      priceFormat,
      productType,
      protocol,
      quoteAddress,
      quoteBalance,
      quoteToken,
      quotePrecision,
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
    auction: productContext.position.positionAuction as AaveLikeHistoryEvent,
    poolId,
    positionTriggers: productContext.automation.positionTriggers,
    priceFormat,
    productType,
    protocol,
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
        ltv: resolvedSimulation?.maxRiskRatio.loanToValue || position.maxRiskRatio.loanToValue,
      })

      // aave v2 is not allowed for refinance
      const refinanceBanner =
        [LendingProtocol.AaveV3, LendingProtocol.SparkV3].includes(protocol) && !isOpening
          ? useOmniRefinanceBanner()
          : undefined

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
          debtMax: getOmniBorrowDebtMax({
            digits: quotePrecision,
            position,
            simulation,
          }),
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
          automation: getAutomationMetadataValues({
            automationForms: productContext.automation.automationForms,
            commonFormState: productContext.automation.commonForm.state,
            hash,
            poolId,
            positionTriggers: productContext.automation.positionTriggers,
            simulationResponse: productContext.automation.simulationData,
            protocol,
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
          renderOverviewBanner: refinanceBanner?.renderOverviewBanner,
          overviewWithSimulation: isYieldLoopWithData,
        },
        featureToggles,
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error(`${protocol} does not support Earn`)
  }
}
