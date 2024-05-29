import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import faqBorrow from 'features/content/faqs/morphoblue/borrow/en'
import faqMultiply from 'features/content/faqs/morphoblue/multiply/en'
import { getAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  getOmniBorrowDebtMax,
  getOmniBorrowishChangeVariant,
  getOmniBorrowPaybackMax,
  getOmniIsFormEmpty,
  getOmniIsFormEmptyStateGuard,
} from 'features/omni-kit/helpers'
import { useOmniRefinanceBanner } from 'features/omni-kit/hooks'
import { useYieldLoopHeadlineDetails } from 'features/omni-kit/hooks/useYieldLoopHeadlineDetails'
import { MorphoDetailsSectionFooter } from 'features/omni-kit/protocols/morpho-blue/components/details-sections'
import { MorphoDetailsSectionContentWrapper } from 'features/omni-kit/protocols/morpho-blue/components/details-sections/MorphoDetailsSectionContentWrapper'
import {
  getMorphoBorrowWithdrawMax,
  getMorphoNotifications,
  morphoFlowStateFilter,
} from 'features/omni-kit/protocols/morpho-blue/helpers'
import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'
import type {
  GetOmniMetadata,
  LendingMetadata,
  OmniFiltersParameters,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { useHash } from 'helpers/useHash'
import { zero } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import React from 'react'

export const useMorphoMetadata: GetOmniMetadata = (productContext) => {
  const {
    MorphoSafetySwitch: morphoSafetySwitchOn,
    MorphoSuppressValidation: morphoSuppressValidation,
  } = useAppConfig('features')

  const {
    environment: {
      collateralAddress,
      collateralPrecision,
      isOracless,
      isYieldLoopWithData,
      pairId,
      poolId,
      productType,
      protocol,
      quoteAddress,
      quoteBalance,
      quotePrecision,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const [hash] = useHash()

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: morphoSafetySwitchOn,
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel.morphoblue,
  })

  const notifications: DetailsSectionNotificationItem[] = getMorphoNotifications({
    productType,
    auction: productContext.position.positionAuction as MorphoHistoryEvent,
  })

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const position = productContext.position.currentPosition.position as MorphoBluePosition
      const simulation = productContext.position.currentPosition.simulation as
        | MorphoBluePosition
        | undefined
      const cachedSimulation = productContext.position.cachedPosition?.simulation as
        | MorphoBluePosition
        | undefined
      const resolvedSimulation = simulation || cachedSimulation

      const { headlineDetails, isLoading: isHeadlineDetailsLoading } = useYieldLoopHeadlineDetails({
        ltv: resolvedSimulation?.maxRiskRatio.loanToValue || position.maxRiskRatio.loanToValue,
      })

      const { renderOverviewBanner } = useOmniRefinanceBanner()

      return {
        notifications,
        validations,
        filters: {
          omniProxyFilter: ({ event, filterConsumed }: OmniFiltersParameters) =>
            morphoFlowStateFilter({
              collateralAddress,
              event,
              filterConsumed,
              pairId,
              productType,
              protocol,
              quoteAddress,
            }),
        },
        values: {
          headlineDetails,
          isHeadlineDetailsLoading,
          interestRate: position.rate,
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
          afterAvailableToBorrow: simulation && negativeToZero(simulation.debtAvailable()),
          afterPositionDebt: resolvedSimulation?.debtAmount,
          withdrawMax: getMorphoBorrowWithdrawMax({
            collateralPrecision,
            position,
            simulation,
          }),
          paybackMax: getOmniBorrowPaybackMax({
            balance: quoteBalance,
            position,
          }),
          footerColumns: isYieldLoopWithData ? 3 : 2,
          maxSliderAsMaxLtv: true,
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
          faq: productType === OmniProductType.Borrow ? faqBorrow : faqMultiply,
          overviewContent: <MorphoDetailsSectionContentWrapper />,
          overviewFooter: <MorphoDetailsSectionFooter />,
          overviewWithSimulation: isYieldLoopWithData,
          renderOverviewBanner,
        },
        featureToggles: {
          safetySwitch: morphoSafetySwitchOn,
          suppressValidation: morphoSuppressValidation,
        },
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error('Morpho does not support Earn')
  }
}
