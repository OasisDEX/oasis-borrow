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
import { MorphoDetailsSectionContent } from 'features/omni-kit/metadata/morpho/MorphoDetailsSectionContent'
import { MorphoDetailsSectionFooter } from 'features/omni-kit/metadata/morpho/MorphoDetailsSectionFooter'
import type { OmniIsCachedPosition } from 'features/omni-kit/types/common.types'
import { useAppConfig } from 'helpers/config'
import { zero } from 'helpers/zero'
import type { FC } from 'react'
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

  const interestRate = new BigNumber(0.01)

  return {
    notifications,
    validations,
    handlers: {
      txSuccessEarnHandler: () => null,
      customReset: () => null,
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
      sidebarTitle: getMorphoSidebarTitle({
        currentStep,
        product,
      }),
      footerColumns: 2,
      headlineDetails: [],
      extraDropdownItems: [],
      earnWithdrawMax: zero,
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
      extraEarnInput: <></>,
      extraEarnInputDeposit: <></>,
      extraEarnInputWithdraw: <></>,
      earnFormOrder: <></>,
      earnFormOrderAsElement: DummyEarnFormAsElement,
      earnExtraUiDropdownContent: <></>,
    },
    featureToggles: {
      safetySwitch: ajnaSafetySwitchOn,
      suppressValidation: ajnaSuppressValidation,
      reusableDpm: ajnaReusableDPMEnabled,
    },
  }
}

const DummyEarnFormAsElement: FC<OmniIsCachedPosition> = () => null
