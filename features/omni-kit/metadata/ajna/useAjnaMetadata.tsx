import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import {
  calculateAjnaMaxLiquidityWithdraw,
  getPoolLiquidity,
  negativeToZero,
} from '@oasisdex/dma-library'
import { getToken } from 'blockchain/tokensMetadata'
import { useGasEstimationContext } from 'components/context/GasEstimationContextProvider'
import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { PillAccordion } from 'components/PillAccordion'
import { ContentFooterItemsBorrow } from 'features/ajna/positions/borrow/components/ContentFooterItemsBorrow'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { getAjnaSidebarTitle } from 'features/ajna/positions/common/getAjnaSidebarTitle'
import { ajnaFlowStateFilter } from 'features/ajna/positions/common/helpers/getFlowStateFilter'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import { getAjnaNotifications } from 'features/ajna/positions/common/notifications'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { getAjnaEarnWithdrawMax } from 'features/ajna/positions/earn/helpers/getAjnaEarnWithdrawMax'
import { OmniDupePositionModal } from 'features/omni-kit/common/components/OmniDupePositionModal'
import { getOmniBorrowishChangeVariant } from 'features/omni-kit/common/helpers/getOmniBorrowishChangeVariant'
import { getOmniBorrowPaybackMax } from 'features/omni-kit/common/helpers/getOmniBorrowPaybackMax'
import { getOmniIsFormEmpty } from 'features/omni-kit/common/helpers/getOmniIsFormEmpty'
import { useAjnaCustomState } from 'features/omni-kit/contexts/custom/AjnaCustomStateContext'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type {
  DynamicProductMetadata,
  ProductContextWithBorrow,
  ProductContextWithEarn,
} from 'features/omni-kit/contexts/OmniProductContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { getAjnaOmniValidation } from 'features/omni-kit/helpers/ajna/getAjnaOmniValidation'
import { AjnaOmniEarnDetailsSectionContent } from 'features/omni-kit/metadata/ajna/AjnaOmniEarnDetailsSectionContent'
import { AjnaOmniEarnDetailsSectionFooter } from 'features/omni-kit/metadata/ajna/AjnaOmniEarnDetailsSectionFooter'
import { AjnaOmniEarnFormOrder } from 'features/omni-kit/metadata/ajna/AjnaOmniEarnFormOrder'
import { AjnaOmniExtraDropdownUiContent } from 'features/omni-kit/metadata/ajna/AjnaOmniExtraDropdownUiContent'
import { AjnaOmniLendingDetailsSectionContent } from 'features/omni-kit/metadata/ajna/AjnaOmniLendingDetailsSectionContent'
import { getAjnaOmniEarnIsFomEmpty } from 'features/omni-kit/metadata/ajna/getAjnaOmniEarnIsFomEmpty'
import { getAjnaOmniEarnIsFormValid } from 'features/omni-kit/metadata/ajna/getAjnaOmniEarnIsFormValid'
import { useAppConfig } from 'helpers/config'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

import { AjnaOmniEarnSlider } from './AjnaOmniEarnSlider'

export const useAjnaMetadata: DynamicProductMetadata = (product) => {
  const { t } = useTranslation()
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
      quotePrice,
      priceFormat,
      collateralToken,
      quoteBalance,
      quoteDigits,
      flow,
      collateralBalance,
      ethBalance,
      ethPrice,
      collateralAddress,
      quoteAddress,
      collateralPrice,
      isShort,
      owner,
      collateralIcon,
      quotePrecision,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()
  const productContext = useOmniProductContext(product)
  // TODO customState that we can use for earn or elsewhere
  const {
    state: { price },
    dispatch,
  } = useAjnaCustomState()

  const position = productContext.position.currentPosition.position as AjnaPosition
  const simulation = productContext.position.currentPosition.simulation as AjnaPosition | undefined

  const originationFee = product === 'earn' ? zero : getOriginationFee(position, simulation)
  const originationFeeFormatted = `${formatCryptoBalance(originationFee)} ${quoteToken}`
  const originationFeeFormattedUSD = `($${formatAmount(originationFee.times(quotePrice), 'USD')})`

  const borrowishContext = productContext as ProductContextWithBorrow
  const earnContext = productContext as ProductContextWithEarn

  const shouldShowDynamicLtv = position.pool.lowestUtilizedPriceIndex.gt(zero)
  const changeVariant =
    // it's hardcoded positive, should be resolved to proper value
    product === 'earn' ? 'positive' : getOmniBorrowishChangeVariant({ simulation, isOracless })

  const earnPosition = productContext.position.currentPosition.position as AjnaEarnPosition
  const earnSimulation = productContext.position.currentPosition.simulation as
    | AjnaEarnPosition
    | undefined

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
    earnIsFormValid:
      product === 'earn'
        ? getAjnaOmniEarnIsFormValid({
            price,
            position: earnPosition,
            currentStep,
            state: (productContext as ProductContextWithEarn).form.state,
          })
        : false,
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

  const afterPositionDebt = product === 'earn' ? zero : simulation?.debtAmount.plus(originationFee)
  const afterAvailableToBorrow =
    product === 'earn'
      ? zero
      : simulation && negativeToZero(simulation.debtAvailable().minus(originationFee))
  const interestRate = position.pool.interestRate

  const isPriceBelowLup =
    product === 'earn'
      ? earnPosition.price.lt(earnPosition.pool.lowestUtilizedPrice) &&
        !earnPosition.pool.lowestUtilizedPriceIndex.isZero()
      : false

  const isFormEmpty = getOmniIsFormEmpty({
    product,
    state: productContext.form.state,
    earnIsFormEmpty:
      product === 'earn'
        ? getAjnaOmniEarnIsFomEmpty({
            price,
            position: earnPosition,
            currentStep,
            state: (productContext as ProductContextWithEarn).form.state,
            txStatus: txDetails?.txStatus,
          })
        : false,
    currentStep,
    txStatus: txDetails?.txStatus,
  })

  return {
    notifications,
    validations,
    handlers: {
      txSuccessEarnHandler: () => earnContext.form.updateState('uiDropdown', 'adjust'),
      customReset: () => dispatch({ type: 'reset' }),
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
      interestRate: interestRate,
      isFormEmpty,
      afterBuyingPower:
        simulation && !simulation.pool.lowestUtilizedPriceIndex.isZero()
          ? simulation.buyingPower
          : undefined,
      shouldShowDynamicLtv,
      debtMin:
        product === 'earn'
          ? zero
          : getAjnaBorrowDebtMin({ digits: getToken(quoteToken).digits, position }),
      debtMax:
        product === 'earn'
          ? zero
          : getAjnaBorrowDebtMax({
              digits: getToken(quoteToken).precision,
              position,
              simulation,
            }),
      changeVariant,
      afterAvailableToBorrow,
      afterPositionDebt,
      collateralMax:
        product === 'earn'
          ? zero
          : getAjnaBorrowCollateralMax({
              digits: getToken(collateralToken).digits,
              position,
              simulation,
            }),
      paybackMax:
        product === 'earn'
          ? zero
          : getOmniBorrowPaybackMax({
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
      footerColumns: 3,
      headlineDetails:
        product === 'earn'
          ? [
              {
                label: t('ajna.position-page.earn.common.headline.current-yield'),
                value: position.pool.lendApr ? formatDecimalAsPercent(position.pool.lendApr) : '-',
              },
              {
                label: t('ajna.position-page.earn.common.headline.30-day-avg'),
                value: (position as unknown as AjnaEarnPosition).poolApy.per30d
                  ? formatDecimalAsPercent(position.pool.apr30dAverage)
                  : '-',
              },
            ]
          : [],
      extraDropdownItems: [
        ...(!(position as unknown as AjnaEarnPosition).collateralTokenAmount?.isZero()
          ? [
              {
                label: t('system.claim-collateral'),
                panel: 'claim-collateral',
                shortLabel: collateralToken,
                tokenIcon: collateralIcon,
                iconShrink: 2,
                action: () => {
                  earnContext.form.dispatch({ type: 'reset' })
                  earnContext.form.updateState('uiDropdown', 'claim-collateral')
                  earnContext.form.updateState('action', 'claim-earn')
                  dispatch({ type: 'reset' })
                },
              },
            ]
          : []),
      ],
      earnWithdrawMax:
        product === 'earn'
          ? getAjnaEarnWithdrawMax({
              quoteTokenAmount: calculateAjnaMaxLiquidityWithdraw({
                pool: position.pool,
                poolCurrentLiquidity: getPoolLiquidity(position.pool),
                position: earnPosition,
                simulation: earnSimulation,
              }),
              digits: quotePrecision,
            })
          : zero,
    },
    elements: {
      highlighterOrderInformation:
        ['borrow', 'multiply'].includes(product) && borrowishContext.form.state.generateAmount ? (
          <HighlightedOrderInformation
            label={t('ajna.position-page.borrow.common.form.origination-fee', { quoteToken })}
            symbol={quoteToken}
            value={`${originationFeeFormatted} ${!isOracless ? originationFeeFormattedUSD : ''}`}
          />
        ) : undefined,
      overviewContent:
        product === 'earn' ? (
          <AjnaOmniEarnDetailsSectionContent
            isSimulationLoading={productContext.position.isSimulationLoading}
            isOracless={isOracless}
            isShort={isShort}
            priceFormat={priceFormat}
            quotePrice={quotePrice}
            quoteToken={quoteToken}
            collateralToken={collateralToken}
            position={earnPosition}
            simulation={earnSimulation}
            flow={flow}
            depositAmount={borrowishContext.form.state.depositAmount}
          />
        ) : (
          <AjnaOmniLendingDetailsSectionContent
            isSimulationLoading={productContext.position.isSimulationLoading}
            thresholdPrice={position.thresholdPrice}
            collateralToken={collateralToken}
            collateralPrice={collateralPrice}
            isOracless={isOracless}
            isShort={isShort}
            priceFormat={priceFormat}
            quotePrice={quotePrice}
            quoteToken={quoteToken}
            position={position}
            simulation={simulation}
            changeVariant={changeVariant}
            afterPositionDebt={afterPositionDebt}
            shouldShowDynamicLtv={shouldShowDynamicLtv}
          />
        ),
      overviewFooter:
        product === 'earn' ? (
          <AjnaOmniEarnDetailsSectionFooter
            isSimulationLoading={productContext.position.isSimulationLoading}
            isOracless={isOracless}
            quotePrice={quotePrice}
            quoteToken={quoteToken}
            collateralToken={collateralToken}
            position={earnPosition}
            simulation={earnSimulation}
            flow={flow}
            depositAmount={borrowishContext.form.state.depositAmount}
            withdrawAmount={borrowishContext.form.state.withdrawAmount}
            availableToWithdraw={calculateAjnaMaxLiquidityWithdraw({
              pool: position.pool,
              poolCurrentLiquidity: getPoolLiquidity(position.pool),
              position: earnPosition,
              simulation: earnSimulation,
            })}
            owner={owner}
          />
        ) : (
          <ContentFooterItemsBorrow
            isLoading={productContext.position.isSimulationLoading}
            collateralToken={collateralToken}
            quoteToken={quoteToken}
            owner={owner}
            cost={interestRate}
            availableToBorrow={position.debtAvailable()}
            afterAvailableToBorrow={afterAvailableToBorrow}
            availableToWithdraw={position.collateralAvailable}
            afterAvailableToWithdraw={simulation?.collateralAvailable}
            changeVariant={changeVariant}
          />
        ),
      overviewBanner: isPoolWithRewards({ collateralToken, quoteToken }) ? (
        <AjnaTokensBannerController flow={flow} isPriceBelowLup={isPriceBelowLup} />
      ) : undefined,
      riskSidebar: <AjnaFormContentRisk />,
      dupeModal: OmniDupePositionModal,
      extraEarnInput: (
        <AjnaOmniEarnSlider
          isDisabled={
            !earnContext.form.state.depositAmount || earnContext.form.state.depositAmount?.lte(0)
          }
          nestedManualInput={!(isOracless && earnPosition.pool.lowestUtilizedPriceIndex.isZero())}
          isFormFrozen={validations.isFormFrozen}
        />
      ),
      extraEarnInputDeposit: (
        <PillAccordion title={t('ajna.position-page.earn.common.form.adjust-lending-price-bucket')}>
          <AjnaOmniEarnSlider
            isDisabled={!earnContext.form.state.depositAmount}
            nestedManualInput={!(isOracless && earnPosition.pool.lowestUtilizedPriceIndex.isZero())}
            isFormFrozen={validations.isFormFrozen}
          />
        </PillAccordion>
      ),
      extraEarnInputWithdraw: (
        <PillAccordion title={t('ajna.position-page.earn.common.form.adjust-lending-price-bucket')}>
          <AjnaOmniEarnSlider
            isDisabled={!earnContext.form.state.withdrawAmount}
            nestedManualInput={!(isOracless && position.pool.lowestUtilizedPriceIndex.isZero())}
            isFormFrozen={validations.isFormFrozen}
          />
        </PillAccordion>
      ),
      earnFormOrder: <AjnaOmniEarnFormOrder />,
      earnFormOrderAsElement: AjnaOmniEarnFormOrder,
      earnExtraUiDropdownContent: (
        <AjnaOmniExtraDropdownUiContent
          isFormValid={validations.isFormValid}
          isFormFrozen={validations.isFormFrozen}
        />
      ),
    },
    featureToggles: {
      safetySwitch: ajnaSafetySwitchOn,
      suppressValidation: ajnaSuppressValidation,
      reusableDpm: ajnaReusableDPMEnabled,
    },
  }
}
