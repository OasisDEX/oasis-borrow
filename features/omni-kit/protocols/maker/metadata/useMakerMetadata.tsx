import type { MakerPosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import { NetworkIds } from 'blockchain/networks'
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
import { getOmniBorrowWithdrawMax } from 'features/omni-kit/helpers/getOmniBorrowWithdrawMax'
import { useOmniRefinanceBanner } from 'features/omni-kit/hooks/useOmniRefinanceBanner'
import { MakerDetailsSectionFooter } from 'features/omni-kit/protocols/maker/components/details-sections'
import { MakerDetailsSectionContentWrapper } from 'features/omni-kit/protocols/maker/components/details-sections/MakerDetailsSectionContentWrapper'
import {
  getMakerNotifications,
  makerFlowStateFilter,
} from 'features/omni-kit/protocols/maker/helpers'
import type { MakerHistoryEvent } from 'features/omni-kit/protocols/maker/history/types'
import type {
  GetOmniMetadata,
  LendingMetadata,
  OmniFiltersParameters,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { formatFiatBalance } from 'helpers/formatters/format'
import { useHash } from 'helpers/useHash'
import { zero } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import React from 'react'

function minutesUntilNextHour() {
  // Get the current time
  const now = new Date()

  // Calculate the number of minutes until the next hour
  const minutes = now.getMinutes()
  const minutesUntilNextHour = 60 - minutes

  // Return formatted string
  return `${minutesUntilNextHour} min`
}

export const useMakerMetadata: GetOmniMetadata = (productContext) => {
  const {
    MorphoSafetySwitch: makerSafetySwitchOn,
    MorphoSuppressValidation: makerSuppressValidation,
  } = useAppConfig('features')

  const {
    environment: {
      collateralAddress,
      collateralPrecision,
      isOracless,
      isYieldLoopWithData,
      pairId,
      productType,
      protocol,
      quoteAddress,
      quoteBalance,
      quotePrecision,
      isOpening,
      networkId,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const [hash] = useHash()

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: makerSafetySwitchOn,
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel.maker,
  })

  const notifications: DetailsSectionNotificationItem[] = getMakerNotifications({
    productType,
    auction: productContext.position.positionAuction as MakerHistoryEvent,
  })

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const position = productContext.position.currentPosition.position as MakerPosition
      const simulation = productContext.position.currentPosition.simulation as
        | MakerPosition
        | undefined
      const cachedSimulation = productContext.position.cachedPosition?.simulation as
        | MakerPosition
        | undefined
      const resolvedSimulation = simulation || cachedSimulation

      const refinanceBanner =
        !isOpening && networkId === NetworkIds.MAINNET ? useOmniRefinanceBanner() : undefined

      return {
        notifications,
        validations,
        filters: {
          omniProxyFilter: ({ event, filterConsumed }: OmniFiltersParameters) =>
            makerFlowStateFilter({
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
          headlineDetails: [
            {
              label: 'Current Price',
              value: `$${formatFiatBalance(position.osmCurrentCollateralPrice)}`,
            },
            {
              label: 'Next Price',
              value: `$${formatFiatBalance(position.osmNextCollateralPrice)}`,
              sub: `in ${minutesUntilNextHour()}`,
              subColor: 'grey',
            },
          ],
          showHeadlineCurrentPrice: false,
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
          withdrawMax: getOmniBorrowWithdrawMax({
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
          automation: getAutomationMetadataValues({
            automationForms: productContext.automation.automationForms,
            commonFormState: productContext.automation.commonForm.state,
            hash,
            positionTriggers: productContext.automation.positionTriggers,
            simulationResponse: productContext.automation.simulationData,
            protocol,
          }),
        },
        elements: {
          faq: productType === OmniProductType.Borrow ? faqBorrow : faqMultiply,
          overviewContent: <MakerDetailsSectionContentWrapper />,
          overviewFooter: <MakerDetailsSectionFooter />,
          overviewWithSimulation: isYieldLoopWithData,
          renderOverviewBanner: refinanceBanner?.renderOverviewBanner,
        },
        featureToggles: {
          safetySwitch: makerSafetySwitchOn,
          suppressValidation: makerSuppressValidation,
        },
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error('Maker does not support Earn')
  }
}
