import type { AjnaPosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import { getToken } from 'blockchain/tokensMetadata'
import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { getAjnaBorrowPaybackMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowPaybackMax'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import {
  ContentCardThresholdPrice,
} from 'features/ajna/positions/common/components/contentCards/ContentCardThresholdPrice'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { getAjnaSidebarTitle } from 'features/ajna/positions/common/getAjnaSidebarTitle'
import { getBorrowishChangeVariant } from 'features/ajna/positions/common/helpers/getBorrowishChangeVariant'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import { getAjnaNotifications } from 'features/ajna/positions/common/notifications'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { getAjnaValidation } from 'features/ajna/positions/common/validation'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type { DynamicProductMetadata, ProductContextWithBorrow } from 'features/omni-kit/contexts/OmniProductContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { useAjnaOmniTxHandler } from 'features/omni-kit/hooks/ajna/useAjnaOmniTxHandler'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const useAjnaMetadata: DynamicProductMetadata = (product) => {
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
    steps: { currentStep },
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
    handlers: {
      txHandler: useAjnaOmniTxHandler(),
    },
    values: {
      netBorrowCost: position.pool.interestRate,
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
      interestRate: position.pool.interestRate,
      changeVariant,
      afterAvailableToBorrow:
        simulation && negativeToZero(simulation.debtAvailable().minus(originationFee)),
      afterPositionDebt: simulation?.debtAmount.plus(originationFee),
      collateralMax: getAjnaBorrowCollateralMax({
        digits: getToken(collateralToken).digits,
        position,
        simulation,
      }),
      paybackMax: getAjnaBorrowPaybackMax({
        balance: quoteBalance,
        digits: quoteDigits,
        position,
      }),
      sidebarTitle: getAjnaSidebarTitle({
        currentStep,
        isFormFrozen: productContext.validation.isFormFrozen,
        product,
        position,
        isOracless,
      }),
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
      overviewBanner: isPoolWithRewards({ collateralToken, quoteToken }) ? (
        <AjnaTokensBannerController flow={flow} />
      ) : undefined,
      riskSidebar: <AjnaFormContentRisk />,
    },
  }
}

// copies, vaalidations, in general things that does not require product context
export const ajnaStaticMetadata = {
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
