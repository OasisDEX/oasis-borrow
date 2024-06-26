import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { getPoolLiquidity, negativeToZero, protocols } from '@oasisdex/dma-library'
import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { PillAccordion } from 'components/PillAccordion'
import faqBorrow from 'features/content/faqs/ajna/borrow/en'
import faqEarn from 'features/content/faqs/ajna/earn/en'
import faqMultiply from 'features/content/faqs/ajna/multiply/en'
import { OmniOpenYieldLoopFooter } from 'features/omni-kit/components/details-section'
import { OmniOpenYieldLoopDetails } from 'features/omni-kit/components/details-section/OmniOpenYieldLoopDetails'
import { MAX_SENSIBLE_LTV } from 'features/omni-kit/constants'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  getOmniBorrowDebtMax,
  getOmniBorrowishChangeVariant,
  getOmniBorrowPaybackMax,
  getOmniIsFormEmpty,
  getOmniIsFormEmptyStateGuard,
} from 'features/omni-kit/helpers'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { useYieldLoopHeadlineDetails } from 'features/omni-kit/hooks/useYieldLoopHeadlineDetails'
import {
  AjnaEarnDetailsSectionContent,
  AjnaEarnDetailsSectionFooter,
  AjnaLendingDetailsSectionContent,
  AjnaLendingDetailsSectionFooter,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts'
import { AjnaTokensBannerController } from 'features/omni-kit/protocols/ajna/controllers/AjnaTokensBannerController'
import {
  ajnaFlowStateFilter,
  getAjnaBorrowDebtMin,
  getAjnaBorrowWithdrawMax,
  getAjnaEarnWithdrawMax,
  getAjnaNotifications,
  getAjnaValidation,
  getOriginationFee,
  isPoolWithRewards,
  resolveIfCachedPosition,
} from 'features/omni-kit/protocols/ajna/helpers'
import { useAjnaSidebarTitle } from 'features/omni-kit/protocols/ajna/hooks'
import {
  AjnaEarnFormOrder,
  AjnaEarnSlider,
  AjnaExtraDropdownUiContent,
  AjnaFormContentRisk,
  getAjnaEarnIsFormValid,
  getEarnIsFormEmpty,
} from 'features/omni-kit/protocols/ajna/metadata'
import type {
  AjnaEarnPositionAuction,
  AjnaPositionAuction,
} from 'features/omni-kit/protocols/ajna/observables'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import type {
  GetOmniMetadata,
  LendingMetadata,
  OmniFiltersParameters,
  ProductContextWithBorrow,
  ProductContextWithEarn,
  ShouldShowDynamicLtvMetadata,
  SupplyMetadata,
} from 'features/omni-kit/types'
import { OmniEarnFormAction, OmniProductType, OmniSidebarEarnPanel } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import { useAppConfig } from 'helpers/config'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { ajnaExtensionTheme } from 'theme'

export const useAjnaMetadata: GetOmniMetadata = (productContext) => {
  const { t } = useTranslation()
  const { AjnaSafetySwitch: ajnaSafetySwitchOn, AjnaSuppressValidation: ajnaSuppressValidation } =
    useAppConfig('features')

  const featureToggles = {
    safetySwitch: ajnaSafetySwitchOn,
    suppressValidation: ajnaSuppressValidation,
  }

  const {
    environment: {
      collateralAddress,
      collateralIcon,
      collateralPrecision,
      collateralPrice,
      collateralToken,
      isOpening,
      isOracless,
      isOwner,
      isProxyWithManyPositions,
      isYieldLoopWithData,
      isShort,
      isYieldLoop,
      networkId,
      owner,
      pairId,
      priceFormat,
      productType,
      protocol,
      protocolRaw,
      quoteAddress,
      quoteBalance,
      quoteDigits,
      quotePrecision,
      quotePrice,
      quoteToken,
    },
    steps: { currentStep },
    tx: { isTxSuccess, txDetails },
  } = useOmniGeneralContext()

  const {
    dispatch,
    state: { price },
  } = useAjnaCustomState()

  const ajnaCustomValidations = getAjnaValidation({
    safetySwitchOn: ajnaSafetySwitchOn,
    isOpening,
    position: productContext.position.currentPosition.position,
    positionAuction: productContext.position.positionAuction as AjnaPositionAuction,
    productType,
    protocol,
    state: productContext.form.state,
  })

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: ajnaSafetySwitchOn,
    earnIsFormValid:
      productType === OmniProductType.Earn
        ? getAjnaEarnIsFormValid({
            price,
            position: productContext.position.currentPosition.position as AjnaEarnPosition,
            currentStep,
            state: (productContext as ProductContextWithEarn).form.state,
          })
        : false,
    isFormFrozen:
      productType === OmniProductType.Earn &&
      (productContext.position.positionAuction as AjnaEarnPositionAuction).isBucketFrozen,
    customErrors: ajnaCustomValidations.localErrors,
    customWarnings: ajnaCustomValidations.localWarnings,
    protocolLabel: LendingProtocolLabel.ajna,
  })

  const notifications = getAjnaNotifications({
    ajnaSafetySwitchOn,
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
    omniProxyFilter: ({ event, filterConsumed }: OmniFiltersParameters) =>
      ajnaFlowStateFilter({
        collateralAddress,
        event,
        filterConsumed,
        pairId,
        productType,
        protocol,
        protocolRaw,
        quoteAddress,
      }),
  }

  const sidebarTitle = useAjnaSidebarTitle({
    position: productContext.position.currentPosition.position as AjnaPosition,
    isFormFrozen: validations.isFormFrozen,
  })

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const position = productContext.position.currentPosition.position as AjnaPosition
      const simulation = productContext.position.currentPosition.simulation as
        | AjnaPosition
        | undefined

      const cachedPosition = productContext.position.cachedPosition?.position as
        | AjnaPosition
        | undefined
      const cachedSimulation = productContext.position.cachedPosition?.simulation as
        | AjnaPosition
        | undefined

      const originationFee = getOriginationFee(position, simulation)
      const originationFeeFormatted = `${formatCryptoBalance(originationFee)} ${quoteToken}`
      const originationFeeFormattedUSD = `($${formatAmount(
        originationFee.times(quotePrice),
        'USD',
      )})`

      const lendingContext = productContext as ProductContextWithBorrow
      const shouldShowDynamicLtv: ShouldShowDynamicLtvMetadata = ({ includeCache }) => {
        return (
          resolveIfCachedPosition({
            cached: includeCache && isTxSuccess,
            cachedPosition: { position: cachedPosition, simulation: cachedSimulation },
            currentPosition: { position, simulation },
          }).positionData?.pool.lowestUtilizedPriceIndex.gt(zero) ?? false
        )
      }

      const resolvedSimulation = simulation || cachedSimulation
      const afterPositionDebt = resolvedSimulation?.debtAmount.plus(originationFee)
      const afterAvailableToBorrow =
        resolvedSimulation &&
        negativeToZero(resolvedSimulation.debtAvailable().minus(originationFee))

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

      const maxRiskRatio = useMemo(() => {
        if (position.maxRiskRatio.loanToValue.gt(MAX_SENSIBLE_LTV)) {
          return MAX_SENSIBLE_LTV
        }
        return position.maxRiskRatio.loanToValue
      }, [position.maxRiskRatio.loanToValue])

      const ltv = useMemo(() => {
        return resolvedSimulation?.riskRatio.loanToValue || maxRiskRatio
      }, [maxRiskRatio, resolvedSimulation?.riskRatio.loanToValue])

      const { headlineDetails, isLoading: isHeadlineDetailsLoading } = useYieldLoopHeadlineDetails({
        ltv,
        poolAddress: position.pool.poolAddress,
      })

      return {
        notifications,
        validations,
        filters,
        values: {
          headlineDetails,
          isHeadlineDetailsLoading,
          interestRate,
          isFormEmpty,
          afterBuyingPower,
          shouldShowDynamicLtv,
          debtMin: getAjnaBorrowDebtMin({ digits: quoteDigits, position }),
          debtMax: getOmniBorrowDebtMax({
            digits: quotePrecision,
            position,
            simulation,
          }),
          changeVariant,
          afterAvailableToBorrow,
          afterPositionDebt,
          withdrawMax: getAjnaBorrowWithdrawMax({
            collateralPrecision,
            position,
            simulation,
          }),
          paybackMax: getOmniBorrowPaybackMax({
            balance: quoteBalance,
            position,
          }),
          sidebarTitle,
          footerColumns: isYieldLoopWithData ? 3 : 2,
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
          overviewContent:
            isYieldLoopWithData && isOpening ? (
              <OmniOpenYieldLoopDetails poolAddress={position.pool.poolAddress} />
            ) : (
              <AjnaLendingDetailsSectionContent
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
                shouldShowDynamicLtv={shouldShowDynamicLtv({ includeCache: false })}
                simulation={simulation}
                isYieldLoop={isYieldLoop}
              />
            ),
          overviewFooter:
            isYieldLoopWithData && isOpening ? (
              <OmniOpenYieldLoopFooter
                getYields={() =>
                  useOmniEarnYields({
                    actionSource: 'ajnaMetadata',
                    ltv,
                    networkId: networkId,
                    protocol,
                    poolAddress: position.pool.poolAddress,
                  })
                }
              />
            ) : (
              <AjnaLendingDetailsSectionFooter
                changeVariant={changeVariant}
                collateralPrice={collateralPrice}
                collateralToken={collateralToken}
                isOracless={isOracless}
                isOwner={isOwner}
                isSimulationLoading={productContext.position.isSimulationLoading}
                networkId={networkId}
                owner={owner}
                position={position}
                productType={productType}
                quotePrice={quotePrice}
                quoteToken={quoteToken}
                simulation={simulation}
              />
            ),
          overviewBanner: isPoolWithRewards({ collateralToken, networkId, quoteToken }) ? (
            <AjnaTokensBannerController isOpening={isOpening} />
          ) : undefined,
          riskSidebar: <AjnaFormContentRisk />,
          overviewWithSimulation: isYieldLoopWithData,
        },
        theme: ajnaExtensionTheme,
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

      const availableToWithdraw = getAjnaEarnWithdrawMax({
        quoteTokenAmount: protocols.ajna.calculateAjnaMaxLiquidityWithdraw({
          pool: earnPosition.pool,
          poolCurrentLiquidity: getPoolLiquidity(earnPosition.pool),
          position: earnPosition,
          simulation: earnSimulation,
        }),
        digits: quotePrecision,
      })

      const afterAvailableToWithdraw = earnSimulation
        ? getAjnaEarnWithdrawMax({
            quoteTokenAmount: protocols.ajna.calculateAjnaMaxLiquidityWithdraw({
              pool: earnSimulation.pool,
              poolCurrentLiquidity: getPoolLiquidity(earnSimulation.pool),
              position: earnSimulation,
            }),
            digits: quotePrecision,
          })
        : undefined

      const isEarnPositionEmpty =
        earnPosition.price.isZero() && earnPosition.quoteTokenAmount.isZero()

      const customReset = () =>
        dispatch({
          type: 'reset',
          price: isEarnPositionEmpty ? earnPosition.pool.lowestUtilizedPrice : earnPosition.price,
        })

      return {
        notifications,
        validations,
        handlers: {
          txSuccessEarnHandler: () =>
            earnContext.form.updateState('uiDropdown', OmniSidebarEarnPanel.Adjust),
          customReset,
        },
        filters,
        values: {
          interestRate: zero,
          isFormEmpty: getEarnIsFormEmpty({
            price,
            position: productContext.position.currentPosition.position as AjnaEarnPosition,
            currentStep,
            state: (productContext as ProductContextWithEarn).form.state,
            txStatus: txDetails?.txStatus,
          }),
          sidebarTitle,
          footerColumns: isOpening || !isYieldLoopWithData ? 2 : 3,
          headlineDetails: [
            {
              label: t('omni-kit.headline.details.current-apy'),
              value: earnPosition.pool.lendApr
                ? formatDecimalAsPercent(earnPosition.pool.lendApr)
                : notAvailable,
            },
            {
              label: t('omni-kit.headline.details.7-days-avg-apy'),
              value: earnPosition.historicalApy.sevenDayAverage
                ? formatDecimalAsPercent(earnPosition.historicalApy.sevenDayAverage)
                : notAvailable,
            },
          ],
          extraDropdownItems: [
            ...(!earnPosition.collateralTokenAmount.isZero()
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
                      customReset()
                    },
                  },
                ]
              : []),
          ],
          earnWithdrawMax: availableToWithdraw,
          earnAfterWithdrawMax: afterAvailableToWithdraw,
          withAdjust: true,
        },
        elements: {
          faq: faqEarn,
          overviewContent: (
            <AjnaEarnDetailsSectionContent
              depositAmount={earnContext.form.state.depositAmount}
              isOpening={isOpening}
              isOracless={isOracless}
              isProxyWithManyPositions={isProxyWithManyPositions}
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
            <AjnaEarnDetailsSectionFooter
              collateralToken={collateralToken}
              isOpening={isOpening}
              isOracless={isOracless}
              isSimulationLoading={productContext.position.isSimulationLoading}
              networkId={networkId}
              position={earnPosition}
              quotePrice={quotePrice}
              quoteToken={quoteToken}
              availableToWithdraw={availableToWithdraw}
              afterAvailableToWithdraw={afterAvailableToWithdraw}
              owner={owner}
            />
          ),
          overviewBanner: isPoolWithRewards({ collateralToken, networkId, quoteToken }) ? (
            <AjnaTokensBannerController isOpening={isOpening} isPriceBelowLup={isPriceBelowLup} />
          ) : undefined,
          riskSidebar: <AjnaFormContentRisk />,
          extraEarnInput: (
            <AjnaEarnSlider
              isDisabled={
                !earnContext.form.state.depositAmount || earnContext.form.state.depositAmount.lte(0)
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
              <AjnaEarnSlider
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
              <AjnaEarnSlider
                isDisabled={!earnContext.form.state.withdrawAmount}
                nestedManualInput={
                  !(isOracless && earnPosition.pool.lowestUtilizedPriceIndex.isZero())
                }
                isFormFrozen={validations.isFormFrozen}
              />
            </PillAccordion>
          ),
          earnFormOrder: <AjnaEarnFormOrder />,
          earnFormOrderAsElement: AjnaEarnFormOrder,
          earnExtraUiDropdownContent: (
            <AjnaExtraDropdownUiContent
              isFormValid={validations.isFormValid}
              isFormFrozen={validations.isFormFrozen}
            />
          ),
          overviewWithSimulation: isYieldLoopWithData,
        },
        theme: ajnaExtensionTheme,
        featureToggles,
      } as SupplyMetadata
    }
    default:
      throw Error('No metadata available for given product')
  }
}
