import type { MorphoPosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { ajnaFlowStateFilter } from 'features/ajna/positions/common/helpers/getFlowStateFilter'
import { getMorphoSidebarTitle } from 'features/morpho/positions/common/getMorphoSidebarTitle'
import { getOmniBorrowishChangeVariant } from 'features/omni-kit/common/helpers/getOmniBorrowishChangeVariant'
import { getOmniBorrowPaybackMax } from 'features/omni-kit/common/helpers/getOmniBorrowPaybackMax'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type { DynamicProductMetadata } from 'features/omni-kit/contexts/OmniProductContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { useAjnaOmniTxHandler } from 'features/omni-kit/hooks/ajna/useAjnaOmniTxHandler'
import { MorphoDetailsSectionContent } from 'features/omni-kit/metadata/morpho/MorphoDetailsSectionContent'
import { MorphoDetailsSectionFooter } from 'features/omni-kit/metadata/morpho/MorphoDetailsSectionFooter'
import { useAppConfig } from 'helpers/config'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export const useMorphoMetadata: DynamicProductMetadata = (product) => {
  const {
    AjnaSafetySwitch: ajnaSafetySwitchOn,
    AjnaSuppressValidation: ajnaSuppressValidation,
    AjnaReusableDPM: ajnaReusableDPMEnabled,
  } = useAppConfig('features')

  const {
    environment: {
      isOracless,
      quoteBalance,
      quoteDigits,
      collateralAddress,
      quoteAddress,
      collateralToken,
      quoteToken,
      isShort,
      flow,
      quotePrice,
      collateralPrice,
    },
    steps: { currentStep },
  } = useOmniGeneralContext()
  const productContext = useOmniProductContext(product)

  const position = productContext.position.currentPosition.position as MorphoPosition
  const simulation = productContext.position.currentPosition.simulation as MorphoPosition

  const shouldShowDynamicLtv = true
  const changeVariant = getOmniBorrowishChangeVariant({ simulation, isOracless })

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

  const afterPositionDebt = simulation?.debtAmount
  const interestRate = new BigNumber(0.01)

  return {
    notifications,
    validations,
    handlers: {
      txHandler: useAjnaOmniTxHandler({ isFormValid: validations.isFormValid }),
    },
    filters: {
      flowStateFilter: (event: CreatePositionEvent) =>
        ajnaFlowStateFilter({ collateralAddress, event, product, quoteAddress }),
      consumedProxyFilter: (event: CreatePositionEvent) =>
        !ajnaFlowStateFilter({ collateralAddress, event, product, quoteAddress }),
    },
    values: {
      // TODO the same value under different key
      netBorrowCost: interestRate,
      interestRate,
      afterBuyingPower: simulation ? simulation.buyingPower : undefined,
      shouldShowDynamicLtv,
      debtMin: new BigNumber(20),
      debtMax: new BigNumber(3000),
      changeVariant,
      afterAvailableToBorrow: simulation && negativeToZero(simulation.debtAvailable()),
      afterPositionDebt,
      collateralMax: new BigNumber(50),
      paybackMax: getOmniBorrowPaybackMax({
        balance: quoteBalance,
        digits: quoteDigits,
        position,
      }),
      sidebarTitle: getMorphoSidebarTitle({
        currentStep,
        product,
      }),
      footerColumns: 2,
    },
    elements: {
      highlighterOrderInformation: undefined,
      overviewContent: (
        <MorphoDetailsSectionContent
          isSimulationLoading={productContext.position.isSimulationLoading}
          isShort={isShort}
          quoteToken={quoteToken}
          collateralToken={collateralToken}
          position={position}
          simulation={simulation}
          changeVariant={changeVariant}
          interestRate={interestRate}
          flow={flow}
          quotePrice={quotePrice}
          collateralPrice={collateralPrice}
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
          product={product}
        />
      ),
      overviewBanner: undefined,
      riskSidebar: <>Morpho risk sidebar</>,
      dupeModal: () => <>Morpho dupe modal</>,
    },
    featureToggles: {
      safetySwitch: ajnaSafetySwitchOn,
      suppressValidation: ajnaSuppressValidation,
      reusableDpm: ajnaReusableDPMEnabled,
    },
  }
}
