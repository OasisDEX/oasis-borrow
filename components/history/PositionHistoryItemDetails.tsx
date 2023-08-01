import { normalizeValue } from '@oasisdex/dma-library'
import { DefinitionList } from 'components/DefinitionList'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import { AjnaUnifiedHistoryEvent } from 'features/ajna/common/ajnaUnifiedHistoryEvent'
import { AaveHistoryEvent } from 'features/ajna/positions/common/helpers/getAjnaHistory'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatFiatBalance,
} from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { FC } from 'react'

import { PositionHistoryRow } from './PositionHistoryRow'

interface PositionHistoryItemDetailsProps {
  collateralToken: string
  event: Partial<AjnaUnifiedHistoryEvent> | Partial<AaveHistoryEvent>
  isOracless?: boolean
  isShort?: boolean
  priceFormat?: string
  quoteToken: string
}

export const PositionHistoryItemDetails: FC<PositionHistoryItemDetailsProps> = ({
  collateralToken,
  event,
  isOracless,
  isShort,
  priceFormat,
  quoteToken,
}) => {
  const { t } = useTranslation()

  return (
    <DefinitionList>
      {event.collateralBefore && event.collateralAfter && (
        <PositionHistoryRow
          label={t(
            event.collateralAfter.gt(event.collateralBefore)
              ? 'position-history.deposited'
              : 'position-history.withdrawn',
          )}
        >
          {formatCryptoBalance(event.collateralBefore)} {collateralToken}{' '}
          <VaultChangesInformationArrow />
          {formatCryptoBalance(event.collateralAfter)} {collateralToken}
        </PositionHistoryRow>
      )}
      {event.debtBefore && event.debtAfter && (
        <PositionHistoryRow
          label={t(
            event.debtAfter.gt(event.debtBefore)
              ? 'position-history.generated'
              : 'position-history.repaid',
          )}
        >
          {formatCryptoBalance(event.debtBefore)} {quoteToken} <VaultChangesInformationArrow />
          {formatCryptoBalance(event.debtAfter)} {quoteToken}
        </PositionHistoryRow>
      )}
      {!isOracless && event.ltvBefore && event.ltvAfter && (
        <PositionHistoryRow label={t('position-history.ltv')}>
          {formatDecimalAsPercent(
            isShort ? normalizeValue(one.div(event.ltvBefore)) : event.ltvBefore,
          )}{' '}
          <VaultChangesInformationArrow />
          {formatDecimalAsPercent(
            isShort ? normalizeValue(one.div(event.ltvAfter)) : event.ltvAfter,
          )}
        </PositionHistoryRow>
      )}
      {event.liquidationPriceBefore && event.liquidationPriceAfter && (
        <PositionHistoryRow label={t('position-history.liquidation-price')}>
          {formatCryptoBalance(
            isShort
              ? normalizeValue(one.div(event.liquidationPriceBefore))
              : event.liquidationPriceBefore,
          )}{' '}
          {priceFormat || `${collateralToken}/${quoteToken}`}
          <VaultChangesInformationArrow />
          {formatCryptoBalance(
            isShort
              ? normalizeValue(one.div(event.liquidationPriceAfter))
              : event.liquidationPriceAfter,
          )}{' '}
          {priceFormat || `${collateralToken}/${quoteToken}`}
        </PositionHistoryRow>
      )}
      {'originationFee' in event && event.originationFee?.gt(zero) && (
        <PositionHistoryRow label={t('position-history.origination-fee')}>
          {formatFiatBalance(event.originationFee)} USD
        </PositionHistoryRow>
      )}
      {event.moveQuoteFromPrice && event.moveQuoteToPrice && (
        <PositionHistoryRow label={t('position-history.lending-price')}>
          {formatFiatBalance(
            isShort ? one.div(event.moveQuoteFromPrice) : event.moveQuoteFromPrice,
          )}{' '}
          USD <VaultChangesInformationArrow />
          {formatFiatBalance(
            isShort ? one.div(event.moveQuoteToPrice) : event.moveQuoteToPrice,
          )}{' '}
          USD
        </PositionHistoryRow>
      )}
      {event.addOrRemovePrice && !event.moveQuoteFromPrice && !event.moveQuoteToPrice && (
        <PositionHistoryRow label={t('position-history.lending-price')}>
          {formatFiatBalance(isShort ? one.div(event.addOrRemovePrice) : event.addOrRemovePrice)}{' '}
          USD
        </PositionHistoryRow>
      )}
      {event.quoteTokensBefore && event.quoteTokensAfter && (
        <PositionHistoryRow
          label={t(
            event.quoteTokensAfter.gt(event.quoteTokensBefore)
              ? 'position-history.deposited'
              : 'position-history.withdrawn',
          )}
        >
          {formatCryptoBalance(event.quoteTokensBefore)} {quoteToken}{' '}
          <VaultChangesInformationArrow />
          {formatCryptoBalance(event.quoteTokensAfter)} {quoteToken}
        </PositionHistoryRow>
      )}
      {event.multipleBefore && event.multipleAfter && (
        <PositionHistoryRow label={t('position-history.multiple')}>
          {event.multipleBefore.toFixed(2)}x <VaultChangesInformationArrow />
          {event.multipleAfter.toFixed(2)}x
        </PositionHistoryRow>
      )}
      {event.netValueBefore && event.netValueAfter && (
        <PositionHistoryRow label={t('position-history.net-value')}>
          {formatFiatBalance(event.netValueBefore)} USD
          <VaultChangesInformationArrow />
          {formatFiatBalance(event.netValueAfter)} USD
        </PositionHistoryRow>
      )}
      {event.swapToAmount && (
        <PositionHistoryRow label={t('position-history.bought')}>
          {formatCryptoBalance(event.swapToAmount)} {collateralToken}
        </PositionHistoryRow>
      )}
      {event.swapFromAmount && (
        <PositionHistoryRow label={t('position-history.sold')}>
          {formatCryptoBalance(event.swapFromAmount)} {collateralToken}
        </PositionHistoryRow>
      )}
      {event.collateralTokenPriceUSD && (
        <PositionHistoryRow label={t('position-history.market-price')}>
          {formatFiatBalance(event.collateralTokenPriceUSD)} USD
        </PositionHistoryRow>
      )}
      {event.totalFee && (
        <PositionHistoryRow label={t('position-history.total-fees')}>
          {formatFiatBalance(event.totalFee)} USD
        </PositionHistoryRow>
      )}
      {/* AUCTION events */}
      {'remainingCollateral' in event && event.remainingCollateral && (
        <PositionHistoryRow label={t('position-history.remaining-collateral')}>
          {formatFiatBalance(event.remainingCollateral)} {collateralToken}
        </PositionHistoryRow>
      )}
      {'debtToCover' in event && event.debtToCover && (
        <PositionHistoryRow label={t('position-history.debt-to-cover')}>
          {formatFiatBalance(event.debtToCover)} {quoteToken}
        </PositionHistoryRow>
      )}
      {'collateralForLiquidation' in event && event.collateralForLiquidation && (
        <PositionHistoryRow label={t('position-history.collateral-for-liquidation')}>
          {formatFiatBalance(event.collateralForLiquidation)} {collateralToken}
        </PositionHistoryRow>
      )}
    </DefinitionList>
  )
}
