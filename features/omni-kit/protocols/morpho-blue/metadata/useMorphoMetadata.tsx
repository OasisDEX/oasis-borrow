import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import faqBorrow from 'features/content/faqs/morphoblue/borrow/en'
import faqMultiply from 'features/content/faqs/morphoblue/multiply/en'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  getOmniBorrowDebtMax,
  getOmniBorrowishChangeVariant,
  getOmniBorrowPaybackMax,
  getOmniIsFormEmpty,
  getOmniIsFormEmptyStateGuard,
} from 'features/omni-kit/helpers'
import {
  MorphoDetailsSectionContent,
  MorphoDetailsSectionFooter,
} from 'features/omni-kit/protocols/morpho-blue/components/details-sections'
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
      pairId,
      productType,
      protocol,
      quoteAddress,
      quoteBalance,
      quotePrecision,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

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
          footerColumns: 2,
          maxSliderAsMaxLtv: true,
        },
        elements: {
          faq: productType === OmniProductType.Borrow ? faqBorrow : faqMultiply,
          overviewContent: <MorphoDetailsSectionContent />,
          overviewFooter: <MorphoDetailsSectionFooter />,
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
