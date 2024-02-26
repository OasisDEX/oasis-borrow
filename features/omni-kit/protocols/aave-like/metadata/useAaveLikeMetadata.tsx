import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import faqBorrowAave from 'features/content/faqs/aave/borrow/en'
import faqEarnAaveV2 from 'features/content/faqs/aave/earn/en_v2'
import faqEarnAaveV3 from 'features/content/faqs/aave/earn/en_v3'
import faqMultiplyAave from 'features/content/faqs/aave/multiply/en'
import faqBorrowSpark from 'features/content/faqs/spark/borrow/en'
import faqEanSpark from 'features/content/faqs/spark/earn/en_v3'
import faqMultiplySpark from 'features/content/faqs/spark/multiply/en'
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
  getAaveLikeNotifications,
  getAaveLikeSidebarTitle,
} from 'features/omni-kit/protocols/aave-like/helpers'
import { morphoFlowStateFilter } from 'features/omni-kit/protocols/morpho-blue/helpers'
import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { zero } from 'helpers/zero'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

const aaveLikeFaqMap = {
  [OmniProductType.Borrow]: {
    [LendingProtocol.AaveV2]: faqBorrowAave,
    [LendingProtocol.AaveV3]: faqBorrowAave,
    [LendingProtocol.SparkV3]: faqBorrowSpark,
  },
  [OmniProductType.Multiply]: {
    [LendingProtocol.AaveV2]: faqMultiplyAave,
    [LendingProtocol.AaveV3]: faqMultiplyAave,
    [LendingProtocol.SparkV3]: faqMultiplySpark,
  },
  [OmniProductType.Earn]: {
    [LendingProtocol.AaveV2]: faqEarnAaveV2,
    [LendingProtocol.AaveV3]: faqEarnAaveV3,
    [LendingProtocol.SparkV3]: faqEanSpark,
  },
}

export const useAaveLikeMetadata: GetOmniMetadata = (productContext) => {
  const {
    AaveV3SafetySwitch: aaveSafetySwitchOn,
    AaveV3SuppressValidation: aaveSuppressValidation,
  } = useAppConfig('features')

  const {
    environment: {
      collateralAddress,
      isOracless,
      productType,
      quoteAddress,
      quoteBalance,
      protocol,
      isYieldLoop,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: aaveSafetySwitchOn,
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel.aavev3,
  })

  const notifications: DetailsSectionNotificationItem[] = getAaveLikeNotifications({
    productType,
    auction: productContext.position.positionAuction as MorphoHistoryEvent,
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
          afterAvailableToBorrow: simulation && negativeToZero(simulation.debtAvailable()),
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
          footerColumns: isYieldLoop ? 3 : 2,
          maxSliderAsMaxLtv: true,
        },
        elements: {
          faq: aaveLikeFaqMap[isYieldLoop ? OmniProductType.Earn : productType][
            protocol as AaveLikeLendingProtocol
          ],
          highlighterOrderInformation: undefined,
          overviewContent: <AaveLikeDetailsSectionContent />,
          overviewFooter: <AaveLikeDetailsSectionFooter />,
        },
        featureToggles: {
          safetySwitch: aaveSafetySwitchOn,
          suppressValidation: aaveSuppressValidation,
        },
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error('Aave does not support Earn')
  }
}
