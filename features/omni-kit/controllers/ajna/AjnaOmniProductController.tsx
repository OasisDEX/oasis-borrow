import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import { getToken } from 'blockchain/tokensMetadata'
import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { getAjnaBorrowPaybackMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowPaybackMax'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import { ContentCardThresholdPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardThresholdPrice'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { getAjnaHeadlineProps } from 'features/ajna/positions/common/helpers/getAjnaHeadlineProps'
import { getBorrowishChangeVariant } from 'features/ajna/positions/common/helpers/getBorrowishChangeVariant'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import { getAjnaNotifications } from 'features/ajna/positions/common/notifications'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { getAjnaValidation } from 'features/ajna/positions/common/validation'
import { AjnaEarnPositionController } from 'features/ajna/positions/earn/controls/AjnaEarnPositionController'
import { getAjnaEarnDefaultAction } from 'features/ajna/positions/earn/helpers/getAjnaEarnDefaultAction'
import { getAjnaEarnDefaultUiDropdown } from 'features/ajna/positions/earn/helpers/getAjnaEarnDefaultUiDropdown'
import { getEarnDefaultPrice } from 'features/ajna/positions/earn/helpers/getEarnDefaultPrice'
import { AjnaCustomStateContextProvider } from 'features/omni-kit/contexts/custom/AjnaCustomStateContext'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type { ProductContextWithBorrow } from 'features/omni-kit/contexts/OmniProductContext'
import {
  OmniProductContextProvider,
  useOmniProductContext,
} from 'features/omni-kit/contexts/OmniProductContext'
import { OmniBorrowPositionController } from 'features/omni-kit/controllers/borrow/OmniBorrowPositionController'
import type { ProductsControllerProps } from 'features/omni-kit/controllers/common/OmniProductController'
import { OmniMultiplyPositionController } from 'features/omni-kit/controllers/multiply/OmniMultiplyPositionController'
import { useAjnaOmniData } from 'features/omni-kit/hooks/ajna/useAjnaOmniData'
import { useAjnaOmniTxHandler } from 'features/omni-kit/hooks/ajna/useAjnaOmniTxHandler'
import { useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow/borrowFormReducto'
import { useOmniEarnFormReducto } from 'features/omni-kit/state/earn/earnFormReducto'
import { useOmniMultiplyFormReducto } from 'features/omni-kit/state/multiply/multiplyFormReducto'
import type { OmniProduct } from 'features/omni-kit/types/common.types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const useAjnaMetadata = (product: OmniProduct) => {
  const { t } = useTranslation()

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
    },
  } = useOmniGeneralContext()
  const productContext = useOmniProductContext(product)
  // TODO customState that we can use for earn or elsewhere
  // const customState = useAjnaCustomState()

  const position = productContext.position.currentPosition.position as AjnaPosition
  const simulation = productContext.position.currentPosition.simulation as AjnaPosition

  const originationFee = getOriginationFee(position, simulation)
  const originationFeeFormatted = `${formatCryptoBalance(originationFee)} ${quoteToken}`
  const originationFeeFormattedUSD = `($${formatAmount(originationFee.times(quotePrice), 'USD')})`

  const borrowishContext = productContext as ProductContextWithBorrow

  const shouldShowDynamicLtv = position.pool.lowestUtilizedPriceIndex.gt(zero)
  const changeVariant = getBorrowishChangeVariant({ simulation, isOracless })

  return {
    txHandler: useAjnaOmniTxHandler(),
    netBorrowCost: position.pool.interestRate,
    afterBuyingPower:
      simulation && !simulation.pool.lowestUtilizedPriceIndex.isZero()
        ? simulation.buyingPower
        : undefined,
    highlighterOrderInformation:
      ['borrow', 'multiply'].includes(product) && borrowishContext.form.state.generateAmount ? (
        <HighlightedOrderInformation
          label={t('ajna.position-page.borrow.common.form.origination-fee', { quoteToken })}
          symbol={quoteToken}
          value={`${originationFeeFormatted} ${!isOracless ? originationFeeFormattedUSD : ''}`}
        />
      ) : undefined,
    shouldShowDynamicLtv,
    debtMin: getAjnaBorrowDebtMin({ digits: getToken(quoteToken).digits, position }),
    debtMax: getAjnaBorrowDebtMax({
      digits: getToken(quoteToken).precision,
      position,
      simulation,
    }),
    interestRate: position.pool.interestRate,
    changeVariant,
    afterAvailableToBorrow:
      simulation && negativeToZero(simulation.debtAvailable().minus(originationFee)),
    afterPositionDebt: simulation?.debtAmount.plus(originationFee),
    extraOverviewCards: [
      isOracless ? (
        <ContentCardThresholdPrice
          isLoading={productContext.position.isSimulationLoading}
          thresholdPrice={position.thresholdPrice}
          debtAmount={position.debtAmount}
          collateralAmount={position.collateralAmount}
          afterThresholdPrice={simulation?.thresholdPrice}
          priceFormat={priceFormat}
          withTooltips
          changeVariant={changeVariant}
          {...(shouldShowDynamicLtv && {
            lup: position.pool.lup,
          })}
        />
      ) : (
        <ContentCardLoanToValue
          isLoading={productContext.position.isSimulationLoading}
          loanToValue={position.riskRatio.loanToValue}
          afterLoanToValue={simulation?.riskRatio.loanToValue}
          {...(shouldShowDynamicLtv && {
            dynamicMaxLtv: position.maxRiskRatio.loanToValue,
          })}
          changeVariant={changeVariant}
        />
      ),
    ],
    collateralMax: getAjnaBorrowCollateralMax({
      digits: getToken(collateralToken).digits,
      position,
      simulation,
    }),
    // TODO this one probably could be on component level and use BorrowishPosition interface
    paybackMax: getAjnaBorrowPaybackMax({
      balance: quoteBalance,
      digits: quoteDigits,
      position,
    }),
    overviewBanner: isPoolWithRewards({ collateralToken, quoteToken }) && (
      <AjnaTokensBannerController flow={flow} />
    ),
    riskSidebar: <AjnaFormContentRisk />,
  }
}

// copies, vaalidations, in general things that does not require product context
const staticMetadata = {
  getValidation: getAjnaValidation,
  getNotifications: getAjnaNotifications,
  customHehe: {
    zelipapo: 'papo',
    extraInput: (
      <VaultActionInput
        action="deposit"
        currencyCode="USDC"
        hasError={false}
        onChange={() => null}
      />
    ),
  },
}

export const AjnaOmniProductController: FC<ProductsControllerProps> = ({
  dpmPosition,
  product,
  flow,
  tokenPriceUSD,
  quoteToken,
  collateralToken,
  protocol,
  tokensIcons,
  id,
}) => {
  const {
    data: { aggregatedData, positionData },
    errors,
  } = useAjnaOmniData({
    collateralToken,
    id,
    product,
    quoteToken,
    tokenPriceUSDData: tokenPriceUSD,
    dpmPositionData: dpmPosition,
    protocol,
  })

  return (
    <WithErrorHandler error={errors}>
      <WithLoadingIndicator
        value={[positionData, aggregatedData]}
        customLoader={
          <PositionLoadingState
            {...getAjnaHeadlineProps({
              collateralToken: dpmPosition.collateralToken,
              flow,
              product: dpmPosition.product as OmniProduct,
              quoteToken: dpmPosition.quoteToken,
              collateralIcon: tokensIcons.collateralToken,
              quoteIcon: tokensIcons.quoteToken,
              id,
            })}
          />
        }
      >
        {([position, { history, auction }]) => (
          <>
            {dpmPosition.product === 'borrow' && (
              <AjnaCustomStateContextProvider>
                <OmniProductContextProvider
                  staticMetadata={staticMetadata}
                  dynamicMetadata={useAjnaMetadata}
                  formDefaults={{
                    action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
                  }}
                  formReducto={useOmniBorrowFormReducto}
                  position={position as AjnaPosition}
                  product={dpmPosition.product}
                  positionAuction={auction as AjnaBorrowishPositionAuction}
                  positionHistory={history}
                >
                  <OmniBorrowPositionController />
                </OmniProductContextProvider>
              </AjnaCustomStateContextProvider>
            )}
            {dpmPosition.product === 'earn' && (
              <AjnaCustomStateContextProvider>
                <OmniProductContextProvider
                  staticMetadata={staticMetadata}
                  dynamicMetadata={useAjnaMetadata}
                  formDefaults={{
                    action: getAjnaEarnDefaultAction(flow, position as AjnaEarnPosition),
                    uiDropdown: getAjnaEarnDefaultUiDropdown(position as AjnaEarnPosition),
                    price: getEarnDefaultPrice(position as AjnaEarnPosition),
                  }}
                  formReducto={useOmniEarnFormReducto}
                  position={position as AjnaEarnPosition}
                  product={dpmPosition.product}
                  positionAuction={auction as AjnaEarnPositionAuction}
                  positionHistory={history}
                >
                  <AjnaEarnPositionController />
                </OmniProductContextProvider>
              </AjnaCustomStateContextProvider>
            )}
            {dpmPosition.product === 'multiply' && (
              <AjnaCustomStateContextProvider>
                <OmniProductContextProvider
                  staticMetadata={staticMetadata}
                  dynamicMetadata={useAjnaMetadata}
                  formDefaults={{
                    action: flow === 'open' ? 'open-multiply' : 'adjust',
                  }}
                  formReducto={useOmniMultiplyFormReducto}
                  position={position as AjnaPosition}
                  product={dpmPosition.product}
                  positionAuction={auction as AjnaBorrowishPositionAuction}
                  positionHistory={history}
                >
                  <OmniMultiplyPositionController />
                </OmniProductContextProvider>
              </AjnaCustomStateContextProvider>
            )}
          </>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
