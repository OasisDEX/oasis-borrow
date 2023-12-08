import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import { DefinitionList } from 'components/DefinitionList'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import type { AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import { type AaveHistoryEvent, hasTrigger } from 'features/omni-kit/protocols/ajna/history/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

import { PositionHistoryRow } from './PositionHistoryRow'

interface PositionHistoryItemDetailsProps {
  collateralToken: string
  event: Partial<AjnaUnifiedHistoryEvent> | Partial<AaveHistoryEvent>
  isOracless?: boolean
  isShort?: boolean
  priceFormat?: string
  quoteToken: string
  networkId: NetworkIds
}

export const PositionHistoryItemDetails: FC<PositionHistoryItemDetailsProps> = ({
  collateralToken,
  event,
  isOracless,
  isShort,
  priceFormat,
  quoteToken,
  networkId,
}) => {
  const { t } = useTranslation()

  const automationNames = ['maxCoverage', 'slLevel']

  if (event.kind?.startsWith('AutomationAdded') && hasTrigger(event)) {
    return (
      <DefinitionList>
        {event.trigger?.decodedDataNames
          ?.map((name, index) => [name, event.trigger?.decodedData[index]] as const)
          ?.filter(([name]) => automationNames.includes(name))
          ?.map(([name, value]) => {
            if (name === 'slLevel') {
              return (
                <PositionHistoryRow label={t('position-history.sl-level')} key={name}>
                  {value && formatPercent(new BigNumber(value).div(100))}
                </PositionHistoryRow>
              )
            }
            return <></>
          })}
      </DefinitionList>
    )
  }

  return (
    <DefinitionList>
      {event.collateralBefore && event.collateralAfter && (
        <PositionHistoryRow
          label={t(
            event.collateralAfter.gt(event.collateralBefore)
              ? 'position-history.collateral-deposit'
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
              ? 'position-history.debt-borrowed'
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
          {!event.liquidationPriceBefore.isNaN() && (
            <>
              {formatCryptoBalance(
                isShort
                  ? normalizeValue(one.div(event.liquidationPriceBefore))
                  : event.liquidationPriceBefore,
              )}{' '}
              {priceFormat || `${collateralToken}/${quoteToken}`}
              <VaultChangesInformationArrow />
            </>
          )}
          {formatCryptoBalance(
            isShort
              ? normalizeValue(one.div(event.liquidationPriceAfter))
              : event.liquidationPriceAfter,
          )}{' '}
          {priceFormat || `${collateralToken}/${quoteToken}`}
        </PositionHistoryRow>
      )}
      {!isOracless && 'originationFee' in event && event.originationFee?.gt(zero) && (
        <PositionHistoryRow label={t('position-history.origination-fee')}>
          {formatFiatBalance(event.originationFee)} {quoteToken}
        </PositionHistoryRow>
      )}
      {isOracless &&
        'originationFeeInQuoteToken' in event &&
        event.originationFeeInQuoteToken?.gt(zero) && (
          <PositionHistoryRow label={t('position-history.origination-fee')}>
            {formatFiatBalance(event.originationFeeInQuoteToken)} {quoteToken}
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
              ? 'position-history.collateral-deposit'
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
      {event.swapToAmount &&
        event.swapToAmount.gt(zero) &&
        event.swapFromAmount &&
        event.swapFromAmount.gt(zero) && (
          <PositionHistoryRow label={t('position-history.swaped')}>
            {formatCryptoBalance(event.swapFromAmount)}{' '}
            {getTokenSymbolBasedOnAddress(networkId, event.swapFromToken!)}
            <VaultChangesInformationArrow />
            {formatCryptoBalance(event.swapToAmount)}{' '}
            {getTokenSymbolBasedOnAddress(networkId, event.swapToToken!)}
          </PositionHistoryRow>
        )}
      {event.collateralTokenPriceUSD && (
        <PositionHistoryRow label={t('position-history.market-price')}>
          {formatFiatBalance(event.collateralTokenPriceUSD)} USD
        </PositionHistoryRow>
      )}
      {!isOracless && event.totalFee && (
        <PositionHistoryRow label={t('position-history.total-fees')}>
          {formatFiatBalance(event.totalFee)} USD
        </PositionHistoryRow>
      )}
      {isOracless && event.totalFeeInQuoteToken && (
        <PositionHistoryRow label={t('position-history.total-fees')}>
          {formatFiatBalance(event.totalFeeInQuoteToken)} {quoteToken}
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
