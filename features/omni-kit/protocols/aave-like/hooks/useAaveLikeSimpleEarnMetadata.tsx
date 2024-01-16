import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { GetOmniMetadata, LendingMetadata } from 'features/omni-kit/contexts'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { getOmniBorrowishChangeVariant } from 'features/omni-kit/helpers'
import { useAaveLikeSidebarTitle } from 'features/omni-kit/protocols/aave-like/hooks/useAaveLikeSidebarTitle'
import { morphoFlowStateFilter } from 'features/omni-kit/protocols/morpho-blue/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { zero } from 'helpers/zero'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export const useAaveLikeSimpleEarnMetadata: GetOmniMetadata = (productContext) => {
  const {
    AaveLikeSimpleEarnSafetySwitch: aaveLikeSimpleEarnSafetySwitchOn,
    AaveLikeSimpleEarnSuppressValidation: aaveLikeSimpleEarnSuppressValidation,
  } = useAppConfig('features')
  const {
    environment: { collateralAddress, isOracless, productType, quoteAddress },
    steps: { currentStep },
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
    case OmniProductType.Earn:
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
          isFormEmpty: true,
          afterBuyingPower: simulation?.buyingPower,
          shouldShowDynamicLtv: () => true,
          debtMin: zero,
          debtMax: zero,
          changeVariant: getOmniBorrowishChangeVariant({ simulation, isOracless }),
          afterAvailableToBorrow: simulation && negativeToZero(simulation.debtAvailable()),
          afterPositionDebt: simulation?.debtAmount,
          collateralMax: simulation?.collateralAvailable ?? position.collateralAmount,
          paybackMax: zero,
          sidebarTitle: useAaveLikeSidebarTitle({
            currentStep,
            productType,
          }),
          footerColumns: 2,
        },
        elements: {
          faq: <></>,
          highlighterOrderInformation: undefined,
          overviewContent: <div>Overview</div>,
          overviewFooter: <div>Overview footer</div>,
        },
        featureToggles: {
          safetySwitch: aaveLikeSimpleEarnSafetySwitchOn,
          suppressValidation: aaveLikeSimpleEarnSuppressValidation,
        },
      } as LendingMetadata

    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
    default:
      throw new Error('Aave Simple deposit does not support borrow/multiply')
  }
}
