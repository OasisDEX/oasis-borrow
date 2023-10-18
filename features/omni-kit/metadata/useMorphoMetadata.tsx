import type { AjnaPosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { useGasEstimationContext } from 'components/context/GasEstimationContextProvider'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import { getAjnaSidebarTitle } from 'features/ajna/positions/common/getAjnaSidebarTitle'
import { getBorrowishChangeVariant } from 'features/ajna/positions/common/helpers/getBorrowishChangeVariant'
import { ajnaFlowStateFilter } from 'features/ajna/positions/common/helpers/getFlowStateFilter'
import { getAjnaNotifications } from 'features/ajna/positions/common/notifications'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { getOmniBorrowPaybackMax } from 'features/omni-kit/common/helpers/getOmniBorrowPaybackMax'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type { DynamicProductMetadata, ProductContextWithBorrow } from 'features/omni-kit/contexts/OmniProductContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { getAjnaOmniValidation } from 'features/omni-kit/helpers/ajna/getAjnaOmniValidation'
import { useAjnaOmniTxHandler } from 'features/omni-kit/hooks/ajna/useAjnaOmniTxHandler'
import { useAppConfig } from 'helpers/config'
import { zero } from 'helpers/zero'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export const useMorphoMetadata: DynamicProductMetadata = (product) => {
  const {
    AjnaSafetySwitch: ajnaSafetySwitchOn,
    AjnaSuppressValidation: ajnaSuppressValidation,
    AjnaReusableDPM: ajnaReusableDPMEnabled,
  } = useAppConfig('features')
  const gasEstimation = useGasEstimationContext()
  const {
    environment: {
      isOracless,
      quoteToken,
      collateralToken,
      quoteBalance,
      quoteDigits,
      flow,
      collateralBalance,
      ethBalance,
      ethPrice,
      collateralAddress,
      quoteAddress,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()
  const productContext = useOmniProductContext(product)
  // TODO customState that we can use for earn or elsewhere
  // const customState = useAjnaCustomState()

  const position = productContext.position.currentPosition.position as AjnaPosition
  const simulation = productContext.position.currentPosition.simulation as AjnaPosition

  const borrowishContext = productContext as ProductContextWithBorrow

  const shouldShowDynamicLtv = position.pool.lowestUtilizedPriceIndex.gt(zero)
  const changeVariant = getBorrowishChangeVariant({ simulation, isOracless })

  const validations = getAjnaOmniValidation({
    ajnaSafetySwitchOn,
    flow,
    collateralBalance,
    collateralToken,
    quoteToken,
    currentStep,
    ethBalance,
    ethPrice,
    gasEstimationUsd: gasEstimation?.usdValue,
    product,
    quoteBalance,
    simulationErrors: productContext.position.simulationCommon?.errors,
    simulationWarnings: productContext.position.simulationCommon?.warnings,
    simulationNotices: productContext.position.simulationCommon?.notices,
    simulationSuccesses: productContext.position.simulationCommon?.successes,
    // TODO can't be just borrowish
    state: borrowishContext.form.state,
    position,
    positionAuction: productContext.position.positionAuction as AjnaPositionAuction,
    txError: txDetails?.txError,
  })

  const notifications = getAjnaNotifications({
    ajnaSafetySwitchOn,
    flow,
    position,
    positionAuction: productContext.position.positionAuction as AjnaPositionAuction,
    product,
    quoteToken,
    collateralToken,
    // TODO can't be just borrowish
    dispatch: borrowishContext.form.dispatch,
    updateState: borrowishContext.form.updateState,
    isOracless,
  })

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
      netBorrowCost: new BigNumber(0.01),
      interestRate: new BigNumber(0.01),
      afterBuyingPower:
        simulation && !simulation.pool.lowestUtilizedPriceIndex.isZero()
          ? simulation.buyingPower
          : undefined,
      shouldShowDynamicLtv,
      debtMin: getAjnaBorrowDebtMin({ digits: getToken(quoteToken).digits, position }),
      debtMax: getAjnaBorrowDebtMax({
        digits: getToken(quoteToken).precision,
        position,
        simulation,
      }),
      changeVariant,
      afterAvailableToBorrow: simulation && negativeToZero(simulation.debtAvailable()),
      afterPositionDebt: simulation?.debtAmount,
      collateralMax: getAjnaBorrowCollateralMax({
        digits: getToken(collateralToken).digits,
        position,
        simulation,
      }),
      paybackMax: getOmniBorrowPaybackMax({
        balance: quoteBalance,
        digits: quoteDigits,
        position,
      }),
      sidebarTitle: getAjnaSidebarTitle({
        currentStep,
        isFormFrozen: validations.isFormFrozen,
        product,
        position,
        isOracless,
      }),
    },
    elements: {
      highlighterOrderInformation: undefined,
      extraOverviewCards: [
        <ContentCardLoanToValue
          isLoading={productContext.position.isSimulationLoading}
          loanToValue={position.riskRatio.loanToValue}
          afterLoanToValue={simulation?.riskRatio.loanToValue}
          {...(shouldShowDynamicLtv && {
            dynamicMaxLtv: position.maxRiskRatio.loanToValue,
          })}
          changeVariant={changeVariant}
        />,
      ],
      overviewBanner: undefined,
      riskSidebar: <>Zeli papo</>,
      dupeModal: () => <></>,
    },
    featureToggles: {
      safetySwitch: ajnaSafetySwitchOn,
      suppressValidation: ajnaSuppressValidation,
      reusableDpm: ajnaReusableDPMEnabled,
    },
  }
}
