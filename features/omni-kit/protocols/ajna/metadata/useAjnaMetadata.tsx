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
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { getAjnaSidebarTitle } from 'features/ajna/positions/common/getAjnaSidebarTitle'
import { ajnaFlowStateFilter } from 'features/ajna/positions/common/helpers/getFlowStateFilter'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { getAjnaEarnWithdrawMax } from 'features/ajna/positions/earn/helpers/getAjnaEarnWithdrawMax'
import faqBorrow from 'features/content/faqs/ajna/borrow/en'
import faqEarn from 'features/content/faqs/ajna/earn/en'
import faqMultiply from 'features/content/faqs/ajna/multiply/en'
import { OmniDupePositionModal } from 'features/omni-kit/components/OmniDupePositionModal'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type {
  GetOmniMetadata,
  LendingMetadata,
  ProductContextWithBorrow,
  ProductContextWithEarn,
  SupplyMetadata,
} from 'features/omni-kit/contexts/OmniProductContext'
import {
  getOmniBorrowishChangeVariant,
  getOmniBorrowPaybackMax,
  getOmniIsFormEmptyStateGuard,
} from 'features/omni-kit/helpers'
import { getOmniIsFormEmpty } from 'features/omni-kit/helpers/getOmniIsFormEmpty'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { AjnaOmniTokensBannerController } from 'features/omni-kit/protocols/ajna/controllers/AjnaOmniTokensBannerController'
import { getAjnaOmniNotifications } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniNotifications'
import { getAjnaOmniValidation } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniValidation'
import { AjnaOmniEarnDetailsSectionContent } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnDetailsSectionContent'
import { AjnaOmniEarnDetailsSectionFooter } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnDetailsSectionFooter'
import { AjnaOmniEarnFormOrder } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnFormOrder'
import { AjnaOmniEarnSlider } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnSlider'
import { AjnaOmniExtraDropdownUiContent } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniExtraDropdownUiContent'
import { AjnaOmniFormContentRisk } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniFormContentRisk'
import { AjnaOmniLendingDetailsSectionContent } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniLendingDetailsSectionContent'
import { AjnaOmniLendingDetailsSectionFooter } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniLendingDetailsSectionFooter'
import { getAjnaOmniEarnIsFomEmpty } from 'features/omni-kit/protocols/ajna/metadata/getAjnaOmniEarnIsFomEmpty'
import { getAjnaOmniEarnIsFormValid } from 'features/omni-kit/protocols/ajna/metadata/getAjnaOmniEarnIsFormValid'
import { OmniEarnFormAction, OmniProductType, OmniSidebarEarnPanel } from 'features/omni-kit/types'
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
  const { AjnaSafetySwitch: ajnaSafetySwitchOn, AjnaSuppressValidation: ajnaSuppressValidation } =
    useAppConfig('features')

  const featureToggles = {
    safetySwitch: ajnaSafetySwitchOn,
    suppressValidation: ajnaSuppressValidation,
  }

  const gasEstimation = useGasEstimationContext()
  const {
    environment: {
      collateralAddress,
      collateralBalance,
      collateralIcon,
      collateralPrice,
      collateralToken,
      ethBalance,
      ethPrice,
      isOpening,
      isOracless,
      isProxyWithManyPositions,
      isShort,
      owner,
      priceFormat,
      productType,
      quoteAddress,
      quoteBalance,
      quoteDigits,
      quotePrecision,
      quotePrice,
      quoteToken,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const {
    dispatch,
    state: { price },
  } = useAjnaCustomState()

  const validations = getAjnaOmniValidation({
    ajnaSafetySwitchOn,
    collateralBalance,
    collateralToken,
    currentStep,
    ethBalance,
    ethPrice,
    gasEstimationUsd: gasEstimation?.usdValue,
    isOpening,
    position: productContext.position.currentPosition.position,
    positionAuction: productContext.position.positionAuction as AjnaPositionAuction,
    productType,
    quoteBalance,
    quoteToken,
    simulationErrors: productContext.position.simulationCommon?.errors,
    simulationNotices: productContext.position.simulationCommon?.notices,
    simulationSuccesses: productContext.position.simulationCommon?.successes,
    simulationWarnings: productContext.position.simulationCommon?.warnings,
    state: productContext.form.state,
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
    collateralToken,
    dispatch: productContext.form.dispatch,
    isOpening,
    isOracless,
    position: productContext.position.currentPosition.position as AjnaGenericPosition,
    positionAuction: productContext.position.positionAuction as AjnaPositionAuction,
    productType,
    quoteToken,
    updateState: productContext.form.updateState,
  })

  const filters = {
    flowStateFilter: (event: CreatePositionEvent) =>
      ajnaFlowStateFilter({ collateralAddress, event, productType, quoteAddress }),
  }

  const riskSidebar = <AjnaOmniFormContentRisk />
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
        stateTypeWrapper: getOmniIsFormEmptyStateGuard({
          type: productType,
          state: productContext.form.state,
        }),
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
        filters,
        values: {
          interestRate,
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
          faq: productType === OmniProductType.Borrow ? faqBorrow : faqMultiply,
          highlighterOrderInformation: lendingContext.form.state.generateAmount ? (
            <HighlightedOrderInformation
              label={t('ajna.position-page.borrow.common.form.origination-fee', { quoteToken })}
              symbol={quoteToken}
              value={`${originationFeeFormatted} ${!isOracless ? originationFeeFormattedUSD : ''}`}
            />
          ) : undefined,
          overviewContent: (
            <AjnaOmniLendingDetailsSectionContent
              afterPositionDebt={afterPositionDebt}
              changeVariant={changeVariant}
              collateralPrice={collateralPrice}
              collateralToken={collateralToken}
              isOpening={isOpening}
              isOracless={isOracless}
              isProxyWithManyPositions={isProxyWithManyPositions}
              isShort={isShort}
              isSimulationLoading={productContext.position.isSimulationLoading}
              owner={owner}
              position={position}
              priceFormat={priceFormat}
              productType={productType}
              quotePrice={quotePrice}
              quoteToken={quoteToken}
              shouldShowDynamicLtv={shouldShowDynamicLtv}
              simulation={simulation}
              thresholdPrice={position.thresholdPrice}
            />
          ),
          overviewFooter: (
            <AjnaOmniLendingDetailsSectionFooter
              afterAvailableToBorrow={afterAvailableToBorrow}
              afterBuyingPower={afterBuyingPower}
              changeVariant={changeVariant}
              collateralToken={collateralToken}
              interestRate={interestRate}
              isSimulationLoading={productContext.position.isSimulationLoading}
              owner={owner}
              position={position}
              productType={productType}
              quoteToken={quoteToken}
              simulation={simulation}
            />
          ),
          overviewBanner: isPoolWithRewards({ collateralToken, quoteToken }) ? (
            <AjnaOmniTokensBannerController isOpening={isOpening} />
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
          txSuccessEarnHandler: () =>
            earnContext.form.updateState('uiDropdown', OmniSidebarEarnPanel.Adjust),
          customReset: () => dispatch({ type: 'reset' }),
        },
        filters,
        values: {
          interestRate: zero,
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
                      earnContext.form.updateState(
                        'uiDropdown',
                        OmniSidebarEarnPanel.ClaimCollateral,
                      )
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
          faq: faqEarn,
          overviewContent: (
            <AjnaOmniEarnDetailsSectionContent
              collateralToken={collateralToken}
              depositAmount={earnContext.form.state.depositAmount}
              isOpening={isOpening}
              isOracless={isOracless}
              isShort={isShort}
              isSimulationLoading={productContext.position.isSimulationLoading}
              position={earnPosition}
              priceFormat={priceFormat}
              quotePrice={quotePrice}
              quoteToken={quoteToken}
              simulation={earnSimulation}
            />
          ),
          overviewFooter: (
            <AjnaOmniEarnDetailsSectionFooter
              collateralToken={collateralToken}
              depositAmount={earnContext.form.state.depositAmount}
              isOpening={isOpening}
              isOracless={isOracless}
              isSimulationLoading={productContext.position.isSimulationLoading}
              position={earnPosition}
              quotePrice={quotePrice}
              quoteToken={quoteToken}
              simulation={earnSimulation}
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
            <AjnaOmniTokensBannerController
              isOpening={isOpening}
              isPriceBelowLup={isPriceBelowLup}
            />
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
