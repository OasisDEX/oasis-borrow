import type { MorphoPosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { ajnaFlowStateFilter } from 'features/ajna/positions/common/helpers/getFlowStateFilter'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type {
  GetOmniMetadata,
  LendingMetadata,
} from 'features/omni-kit/contexts/OmniProductContext'
import { getOmniBorrowishChangeVariant, getOmniBorrowPaybackMax } from 'features/omni-kit/helpers'
import { useMorphoSidebarTitle } from 'features/omni-kit/protocols/morpho-blue/hooks'
import { MorphoDetailsSectionContent } from 'features/omni-kit/protocols/morpho-blue/metadata/MorphoDetailsSectionContent'
import { MorphoDetailsSectionFooter } from 'features/omni-kit/protocols/morpho-blue/metadata/MorphoDetailsSectionFooter'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export const useMorphoMetadata: GetOmniMetadata = (productContext) => {
  const { MorphoSafetySwitch, MorphoSuppressValidation } = useAppConfig('features')

  const {
    environment: {
      collateralAddress,
      collateralPrice,
      collateralToken,
      isOpening,
      isOracless,
      isShort,
      productType,
      quoteAddress,
      quoteBalance,
      quoteDigits,
      quotePrice,
      quoteToken,
    },
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

  const interestRate = new BigNumber(0.01)

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const position = productContext.position.currentPosition.position as MorphoPosition
      const simulation = productContext.position.currentPosition.simulation as
        | MorphoPosition
        | undefined

      const changeVariant = getOmniBorrowishChangeVariant({ simulation, isOracless })
      const shouldShowDynamicLtv = true

      return {
        notifications,
        validations,
        handlers: {
          customReset: () => null,
        },
        filters: {
          flowStateFilter: (event: CreatePositionEvent) =>
            ajnaFlowStateFilter({ collateralAddress, event, productType, quoteAddress }),
        },
        values: {
          interestRate,
          isFormEmpty: false,
          afterBuyingPower: simulation ? simulation.buyingPower : undefined,
          shouldShowDynamicLtv,
          debtMin: new BigNumber(20),
          debtMax: new BigNumber(3000),
          changeVariant,
          afterAvailableToBorrow: simulation && negativeToZero(simulation.debtAvailable()),
          afterPositionDebt: simulation?.debtAmount,
          collateralMax: new BigNumber(50),
          paybackMax: getOmniBorrowPaybackMax({
            balance: quoteBalance,
            digits: quoteDigits,
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
          overviewContent: (
            <MorphoDetailsSectionContent
              changeVariant={changeVariant}
              collateralPrice={collateralPrice}
              collateralToken={collateralToken}
              interestRate={interestRate}
              isOpening={isOpening}
              isShort={isShort}
              isSimulationLoading={productContext.position.isSimulationLoading}
              position={position}
              quotePrice={quotePrice}
              quoteToken={quoteToken}
              simulation={simulation}
              // TODO to be defined
              liquidationPenalty={new BigNumber(0.01)}
            />
          ),
          overviewFooter: (
            <MorphoDetailsSectionFooter
              position={position}
              simulation={simulation}
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              productType={productType}
            />
          ),
          dupeModal: () => <>Morpho dupe modal</>,
        },
        featureToggles: {
          safetySwitch: MorphoSafetySwitch,
          suppressValidation: MorphoSuppressValidation,
        },
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error('Morpho does not support Earn')
  }
}
