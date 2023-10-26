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
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { getAjnaSidebarTitle } from 'features/ajna/positions/common/getAjnaSidebarTitle'
import { ajnaFlowStateFilter } from 'features/ajna/positions/common/helpers/getFlowStateFilter'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { getAjnaEarnWithdrawMax } from 'features/ajna/positions/earn/helpers/getAjnaEarnWithdrawMax'
import { OmniDupePositionModal } from 'features/omni-kit/components/OmniDupePositionModal'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type {
  GetOmniMetadata,
  LendingMetadata,
  ProductContextWithBorrow,
  ProductContextWithEarn,
  SupplyMetadata,
} from 'features/omni-kit/contexts/OmniProductContext'
import { getOmniBorrowishChangeVariant, getOmniBorrowPaybackMax } from 'features/omni-kit/helpers'
import { getOmniIsFormEmpty } from 'features/omni-kit/helpers/getOmniIsFormEmpty'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { getAjnaOmniNotifications } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniNotifications'
import { getAjnaOmniValidation } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniValidation'
import { AjnaOmniEarnDetailsSectionContent } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnDetailsSectionContent'
import { AjnaOmniEarnDetailsSectionFooter } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnDetailsSectionFooter'
import { AjnaOmniEarnFormOrder } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnFormOrder'
import { AjnaOmniEarnSlider } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnSlider'
import { AjnaOmniExtraDropdownUiContent } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniExtraDropdownUiContent'
import { AjnaOmniLendingDetailsSectionContent } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniLendingDetailsSectionContent'
import { AjnaOmniLendingDetailsSectionFooter } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniLendingDetailsSectionFooter'
import { getAjnaOmniEarnIsFomEmpty } from 'features/omni-kit/protocols/ajna/metadata/getAjnaOmniEarnIsFomEmpty'
import { getAjnaOmniEarnIsFormValid } from 'features/omni-kit/protocols/ajna/metadata/getAjnaOmniEarnIsFormValid'
import { OmniEarnFormAction, OmniProductType } from 'features/omni-kit/types'
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

export const useAjnaMetadata: GetOmniMetadata = (productContext) => {
  const { t } = useTranslation()
  const {
    AjnaSafetySwitch: ajnaSafetySwitchOn,
    AjnaSuppressValidation: ajnaSuppressValidation,
    AjnaReusableDPM: ajnaReusableDPMEnabled,
  } = useAppConfig('features')

  const featureToggles = {
    safetySwitch: ajnaSafetySwitchOn,
    suppressValidation: ajnaSuppressValidation,
    reusableDpm: ajnaReusableDPMEnabled,
  }

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
      productType,
      isProxyWithManyPositions,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const {
    state: { price },
    dispatch,
  } = useAjnaCustomState()

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
    productType,
    quoteBalance,
    simulationErrors: productContext.position.simulationCommon?.errors,
    simulationWarnings: productContext.position.simulationCommon?.warnings,
    simulationNotices: productContext.position.simulationCommon?.notices,
    simulationSuccesses: productContext.position.simulationCommon?.successes,
    state: productContext.form.state,
    position: productContext.position.currentPosition.position,
    positionAuction: productContext.position.positionAuction as AjnaPositionAuction,
    txError: txDetails?.txError,
    earnIsFormValid:
      productType === OmniProductType.Earn
        ? getAjnaOmniEarnIsFormValid({
            price,
            position: productContext.position.currentPosition.position as AjnaEarnPosition,
            currentStep,
            state: (productContext as ProductContextWithEarn).form.state,
          })
        : false,
  })

  const notifications = getAjnaOmniNotifications({
    ajnaSafetySwitchOn,
    flow,
    // @ts-ignore TODO
    position: productContext.position.currentPosition.position,
    positionAuction: productContext.position.positionAuction as AjnaPositionAuction,
    productType,
    quoteToken,
    collateralToken,
    dispatch: productContext.form.dispatch,
    // @ts-ignore TODO
    updateState: productContext.form.updateState,
    isOracless,
  })

  const filters = {
    flowStateFilter: (event: CreatePositionEvent) =>
      ajnaFlowStateFilter({ collateralAddress, event, productType, quoteAddress }),
    consumedProxyFilter: (event: CreatePositionEvent) =>
      !ajnaFlowStateFilter({ collateralAddress, event, productType, quoteAddress }),
  }

  const riskSidebar = <AjnaFormContentRisk />
  const dupeModal = OmniDupePositionModal

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const position = productContext.position.currentPosition.position as AjnaPosition
      const simulation = productContext.position.currentPosition.simulation as
        | AjnaPosition
        | undefined

      const originationFee = getOriginationFee(position, simulation)
      const originationFeeFormatted = `${formatCryptoBalance(originationFee)} ${quoteToken}`
      const originationFeeFormattedUSD = `($${formatAmount(
        originationFee.times(quotePrice),
        'USD',
      )})`

      const lendingContext = productContext as ProductContextWithBorrow
      const shouldShowDynamicLtv = position.pool.lowestUtilizedPriceIndex.gt(zero)

      const afterPositionDebt = simulation?.debtAmount.plus(originationFee)
      const afterAvailableToBorrow =
        simulation && negativeToZero(simulation.debtAvailable().minus(originationFee))
      const interestRate = position.pool.interestRate

      const changeVariant = getOmniBorrowishChangeVariant({ simulation, isOracless })

      const isFormEmpty = getOmniIsFormEmpty({
        productType,
        state: productContext.form.state,
        currentStep,
        txStatus: txDetails?.txStatus,
      })

      const afterBuyingPower =
        simulation && !simulation.pool.lowestUtilizedPriceIndex.isZero()
          ? simulation.buyingPower
          : undefined

      return {
        notifications,
        validations,
        handlers: {
          customReset: () => null,
        },
        filters,
        values: {
          // TODO the same value under different key
          netBorrowCost: interestRate,
          interestRate: interestRate,
          isFormEmpty,
          afterBuyingPower,
          shouldShowDynamicLtv,
          debtMin: getAjnaBorrowDebtMin({ digits: getToken(quoteToken).digits, position }),
          debtMax: getAjnaBorrowDebtMax({
            digits: getToken(quoteToken).precision,
            position,
            simulation,
          }),
          changeVariant,
          afterAvailableToBorrow,
          afterPositionDebt,
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
            productType,
            position,
            isOracless,
          }),
          footerColumns: productType === OmniProductType.Borrow ? 3 : 2,
        },
        elements: {
          highlighterOrderInformation: lendingContext.form.state.generateAmount ? (
            <HighlightedOrderInformation
              label={t('ajna.position-page.borrow.common.form.origination-fee', { quoteToken })}
              symbol={quoteToken}
              value={`${originationFeeFormatted} ${!isOracless ? originationFeeFormattedUSD : ''}`}
            />
          ) : undefined,
          overviewContent: (
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
              productType={productType}
              owner={owner}
              flow={flow}
              isProxyWithManyPositions={isProxyWithManyPositions}
            />
          ),
          overviewFooter: (
            <AjnaOmniLendingDetailsSectionFooter
              isSimulationLoading={productContext.position.isSimulationLoading}
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              position={position}
              simulation={simulation}
              changeVariant={changeVariant}
              afterAvailableToBorrow={afterAvailableToBorrow}
              afterBuyingPower={afterBuyingPower}
              productType={productType}
              owner={owner}
              interestRate={interestRate}
            />
          ),
          overviewBanner: isPoolWithRewards({ collateralToken, quoteToken }) ? (
            <AjnaTokensBannerController flow={flow} />
          ) : undefined,
          riskSidebar,
          dupeModal,
        },
        featureToggles,
      } as LendingMetadata

    case OmniProductType.Earn: {
      const earnContext = productContext as ProductContextWithEarn

      const earnPosition = productContext.position.currentPosition.position as AjnaEarnPosition
      const earnSimulation = productContext.position.currentPosition.simulation as
        | AjnaEarnPosition
        | undefined

      const isPriceBelowLup =
        earnPosition.price.lt(earnPosition.pool.lowestUtilizedPrice) &&
        !earnPosition.pool.lowestUtilizedPriceIndex.isZero()

      return {
        notifications,
        validations,
        handlers: {
          txSuccessEarnHandler: () => earnContext.form.updateState('uiDropdown', 'adjust'),
          customReset: () => dispatch({ type: 'reset' }),
        },
        filters,
        values: {
          interestRate: zero, // TODO it's borrow rate and for earn shouldn't be required
          isFormEmpty: getAjnaOmniEarnIsFomEmpty({
            price,
            position: productContext.position.currentPosition.position as AjnaEarnPosition,
            currentStep,
            state: (productContext as ProductContextWithEarn).form.state,
            txStatus: txDetails?.txStatus,
          }),
          sidebarTitle: getAjnaSidebarTitle({
            currentStep,
            isFormFrozen: validations.isFormFrozen,
            productType,
            position: earnPosition,
            isOracless,
          }),
          footerColumns: 3,
          headlineDetails: [
            {
              label: t('ajna.position-page.earn.common.headline.current-yield'),
              value: earnPosition.pool.lendApr
                ? formatDecimalAsPercent(earnPosition.pool.lendApr)
                : '-',
            },
            {
              label: t('ajna.position-page.earn.common.headline.30-day-avg'),
              value: earnPosition.poolApy.per30d
                ? formatDecimalAsPercent(earnPosition.pool.apr30dAverage)
                : '-',
            },
          ],
          extraDropdownItems: [
            ...(!earnPosition.collateralTokenAmount?.isZero()
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
                      earnContext.form.updateState('action', OmniEarnFormAction.ClaimEarn)
                      dispatch({ type: 'reset' })
                    },
                  },
                ]
              : []),
          ],
          earnWithdrawMax:
            productType === OmniProductType.Earn
              ? getAjnaEarnWithdrawMax({
                  quoteTokenAmount: calculateAjnaMaxLiquidityWithdraw({
                    pool: earnPosition.pool,
                    poolCurrentLiquidity: getPoolLiquidity(earnPosition.pool),
                    position: earnPosition,
                    simulation: earnSimulation,
                  }),
                  digits: quotePrecision,
                })
              : zero,
        },
        elements: {
          overviewContent: (
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
              depositAmount={earnContext.form.state.depositAmount}
            />
          ),
          overviewFooter: (
            <AjnaOmniEarnDetailsSectionFooter
              isSimulationLoading={productContext.position.isSimulationLoading}
              isOracless={isOracless}
              quotePrice={quotePrice}
              quoteToken={quoteToken}
              collateralToken={collateralToken}
              position={earnPosition}
              simulation={earnSimulation}
              flow={flow}
              depositAmount={earnContext.form.state.depositAmount}
              withdrawAmount={earnContext.form.state.withdrawAmount}
              availableToWithdraw={calculateAjnaMaxLiquidityWithdraw({
                pool: earnPosition.pool,
                poolCurrentLiquidity: getPoolLiquidity(earnPosition.pool),
                position: earnPosition,
                simulation: earnSimulation,
              })}
              owner={owner}
            />
          ),
          overviewBanner: isPoolWithRewards({ collateralToken, quoteToken }) ? (
            <AjnaTokensBannerController flow={flow} isPriceBelowLup={isPriceBelowLup} />
          ) : undefined,
          riskSidebar,
          dupeModal,
          extraEarnInput: (
            <AjnaOmniEarnSlider
              isDisabled={
                !earnContext.form.state.depositAmount ||
                earnContext.form.state.depositAmount?.lte(0)
              }
              nestedManualInput={
                !(isOracless && earnPosition.pool.lowestUtilizedPriceIndex.isZero())
              }
              isFormFrozen={validations.isFormFrozen}
            />
          ),
          extraEarnInputDeposit: (
            <PillAccordion
              title={t('ajna.position-page.earn.common.form.adjust-lending-price-bucket')}
            >
              <AjnaOmniEarnSlider
                isDisabled={!earnContext.form.state.depositAmount}
                nestedManualInput={
                  !(isOracless && earnPosition.pool.lowestUtilizedPriceIndex.isZero())
                }
                isFormFrozen={validations.isFormFrozen}
              />
            </PillAccordion>
          ),
          extraEarnInputWithdraw: (
            <PillAccordion
              title={t('ajna.position-page.earn.common.form.adjust-lending-price-bucket')}
            >
              <AjnaOmniEarnSlider
                isDisabled={!earnContext.form.state.withdrawAmount}
                nestedManualInput={
                  !(isOracless && earnPosition.pool.lowestUtilizedPriceIndex.isZero())
                }
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
        featureToggles,
      } as SupplyMetadata
    }
    default:
      throw Error('No metadata available for given product')
  }
}
