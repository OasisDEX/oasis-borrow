import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { GetOmniMetadata, LendingMetadata } from 'features/omni-kit/contexts'
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
import { morphoFlowStateFilter } from 'features/omni-kit/protocols/morpho-blue/helpers'
import { useMorphoSidebarTitle } from 'features/omni-kit/protocols/morpho-blue/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { zero } from 'helpers/zero'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export const useMorphoMetadata: GetOmniMetadata = (productContext) => {
  const {
    MorphoSafetySwitch: morphoSafetySwitchOn,
    MorphoSuppressValidation: morphoSuppressValidation,
  } = useAppConfig('features')

  const {
    environment: {
      collateralAddress,
      isOracless,
      productType,
      quoteAddress,
      quoteBalance,
      quotePrecision,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const validations = {
    isFormValid: true,
    hasErrors: false,
    isFormFrozen: false,
    errors: [],
    warnings: [],
    notices: [],
    successes: [],
  }

  const notifications: DetailsSectionNotificationItem[] = []

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const position = productContext.position.currentPosition.position as MorphoBluePosition
      const simulation = productContext.position.currentPosition.simulation as
        | MorphoBluePosition
        | undefined

      return {
        notifications,
        validations,
        handlers: {
          customReset: () => null,
        },
        filters: {
          flowStateFilter: (event: CreatePositionEvent) =>
            morphoFlowStateFilter({ collateralAddress, event, productType, quoteAddress }),
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
          shouldShowDynamicLtv: () => true,
          debtMin: zero,
          debtMax: getOmniBorrowDebtMax({
            digits: quotePrecision,
            position,
            simulation,
          }),
          changeVariant: getOmniBorrowishChangeVariant({ simulation, isOracless }),
          afterAvailableToBorrow: simulation && negativeToZero(simulation.debtAvailable()),
          afterPositionDebt: simulation?.debtAmount,
          collateralMax: simulation?.collateralAvailable ?? position.collateralAmount,
          paybackMax: getOmniBorrowPaybackMax({
            balance: quoteBalance,
            position,
          }),
          sidebarTitle: useMorphoSidebarTitle({
            currentStep,
            productType,
          }),
          footerColumns: 2,
        },
        elements: {
          faq: <></>,
          highlighterOrderInformation: undefined,
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
