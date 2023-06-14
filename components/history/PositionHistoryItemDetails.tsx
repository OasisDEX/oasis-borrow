import { normalizeValue } from '@oasisdex/dma-library'
import { DefinitionList } from 'components/DefinitionList'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import {
  AaveHistoryEvent,
  AjnaHistoryEvent,
} from 'features/ajna/positions/common/helpers/getAjnaHistory'
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
  event: Partial<AjnaHistoryEvent> | Partial<AaveHistoryEvent>
  collateralToken: string
  quoteToken: string
  isShort?: boolean
  priceFormat?: string
}

export const PositionHistoryItemDetails: FC<PositionHistoryItemDetailsProps> = ({
  event,
  collateralToken,
  quoteToken,
  isShort,
  priceFormat,
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
      {event.ltvBefore && event.ltvAfter && (
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
          {formatFiatBalance(event.moveQuoteFromPrice)} USD <VaultChangesInformationArrow />
          {formatFiatBalance(event.moveQuoteToPrice)} USD
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
      {event.totalFee && (
        <PositionHistoryRow label={t('position-history.total-fees')}>
          {formatFiatBalance(event.totalFee)} USD
        </PositionHistoryRow>
      )}
    </DefinitionList>
  )
}
