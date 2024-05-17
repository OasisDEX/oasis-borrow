import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import { DefinitionList } from 'components/DefinitionList'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import { maxUint256 } from 'features/automation/common/consts'
import { type AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
import { hasTrigger } from 'features/omni-kit/protocols/ajna/history/types'
import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { Fragment } from 'react'

import { PositionHistoryRow } from './PositionHistoryRow'

interface PositionHistoryItemDetailsProps {
  collateralToken: string
  event:
    | Partial<AjnaHistoryEvent>
    | Partial<AaveLikeHistoryEvent>
    | Partial<MorphoHistoryEvent>
    | Partial<PositionHistoryEvent>
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

  enum AutomationName {
    maxCoverage = 'maxCoverage',
    slLevel = 'slLevel',
    executionLtv = 'executionLtv',
    targetLtv = 'targetLtv',
    trailingDistance = 'trailingDistance',
    executionPrice = 'executionPrice',
    excutionPrice = 'excutionPrice',
    minSellPrice = 'minSellPrice',
    maxBuyPrice = 'maxBuyPrice',
  }
  const getPositionHistoryRow = (
    name: string,
    value: string,
    historyEvent:
      | Partial<AjnaHistoryEvent>
      | Partial<AaveLikeHistoryEvent>
      | Partial<MorphoHistoryEvent>
      | Partial<PositionHistoryEvent>,
  ) => {
    switch (name) {
      case AutomationName.minSellPrice:
        return (
          <PositionHistoryRow label={t('position-history.min-sell-price')}>
            {`${value && formatCryptoBalance(new BigNumber(value).div(100000000))} ${
              historyEvent.collateralToken
            }/${historyEvent.debtToken}`}
          </PositionHistoryRow>
        )
      case AutomationName.maxBuyPrice:
        let limit = '-'
        if (value !== maxUint256.toString()) {
          limit = `${value && formatCryptoBalance(new BigNumber(value).div(100000000))} ${
            historyEvent.collateralToken
          }/${historyEvent.debtToken}`
        }
        return (
          <PositionHistoryRow label={t('position-history.max-buy-price')}>
            {limit}
          </PositionHistoryRow>
        )

      case AutomationName.slLevel:
        return (
          <PositionHistoryRow label={t('position-history.sl-level')}>
            {value && formatPercent(new BigNumber(value).div(100))}
          </PositionHistoryRow>
        )
      case AutomationName.executionLtv:
        return (
          <PositionHistoryRow label={t('position-history.execution-ltv')}>
            {value && formatPercent(new BigNumber(value).div(100))}
          </PositionHistoryRow>
        )
      case AutomationName.targetLtv:
        return (
          <PositionHistoryRow label={t('position-history.target-ltv')}>
            {value && formatPercent(new BigNumber(value).div(100))}
          </PositionHistoryRow>
        )
      case AutomationName.trailingDistance:
        return (
          <PositionHistoryRow label={t('position-history.trailing-distance')}>
            {`${value && formatCryptoBalance(new BigNumber(value).div(100000000))} ${
              historyEvent.collateralToken
            }/${historyEvent.debtToken}`}
          </PositionHistoryRow>
        )
      case AutomationName.executionPrice:
      case AutomationName.excutionPrice:
        return (
          <PositionHistoryRow label={t('position-history.execution-price')}>
            {`${value && formatCryptoBalance(new BigNumber(value).div(100000000))} ${
              historyEvent.collateralToken
            }/${historyEvent.debtToken}`}
          </PositionHistoryRow>
        )
      default:
        return <></>
    }
  }
  if (
    (event.kind?.startsWith('AutomationAdded') ||
      event.kind?.startsWith('AutomationRemoved') ||
      event.kind?.startsWith('AutomationUpdated')) &&
    hasTrigger(event)
  ) {
    return (
      <DefinitionList>
        {event.trigger?.decodedDataNames
          ?.map((name, index) => [name, event.trigger?.decodedData[index]] as const)
          ?.filter(([name]) => Object.values(AutomationName).includes(name as AutomationName))
          ?.map(([name, value]) => (
            <Fragment key={name}>{getPositionHistoryRow(name, value, event)}</Fragment>
          ))}
      </DefinitionList>
    )
  }

  return (
    <DefinitionList>
      {event.depositAmount && (
        <PositionHistoryRow label={t('position-history.collateral-deposit')}>
          {formatCryptoBalance(event.depositAmount)} {collateralToken}
        </PositionHistoryRow>
      )}
      {event.collateralBefore && event.collateralAfter && (
        <PositionHistoryRow label={t('position-history.total-collateral')}>
          {formatCryptoBalance(event.collateralBefore)} {collateralToken}{' '}
          <VaultChangesInformationArrow />
          {formatCryptoBalance(event.collateralAfter)} {collateralToken}
        </PositionHistoryRow>
      )}
      {event.debtBefore && event.debtAfter && (
        <PositionHistoryRow label={t('position-history.position-debt')}>
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
      {'moveQuoteFromPrice' in event && event.moveQuoteFromPrice && event.moveQuoteToPrice && (
        <PositionHistoryRow label={t('position-history.lending-price')}>
          {formatCryptoBalance(
            isShort ? one.div(event.moveQuoteFromPrice) : event.moveQuoteFromPrice,
          )}{' '}
          {quoteToken} <VaultChangesInformationArrow />
          {formatCryptoBalance(
            isShort ? one.div(event.moveQuoteToPrice) : event.moveQuoteToPrice,
          )}{' '}
          {quoteToken}
        </PositionHistoryRow>
      )}
      {'addOrRemovePrice' in event &&
        event.addOrRemovePrice &&
        !event.moveQuoteFromPrice &&
        !event.moveQuoteToPrice && (
          <PositionHistoryRow label={t('position-history.lending-price')}>
            {formatCryptoBalance(
              isShort ? one.div(event.addOrRemovePrice) : event.addOrRemovePrice,
            )}{' '}
            {quoteToken}
          </PositionHistoryRow>
        )}
      {'quoteTokensBefore' in event && event.quoteTokensBefore && event.quoteTokensAfter && (
        <PositionHistoryRow label={t('position-history.total-collateral')}>
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
      {event.swapToAmount && event.swapFromAmount?.gt(zero) && (
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
          {isShort
            ? formatCryptoBalance(event.debtTokenPriceUSD!.div(event.collateralTokenPriceUSD))
            : formatCryptoBalance(event.collateralTokenPriceUSD.div(event.debtTokenPriceUSD!))}{' '}
          {isShort ? `${quoteToken}/${collateralToken}` : `${collateralToken}/${quoteToken}`}
        </PositionHistoryRow>
      )}
      {!isOracless && event.totalFee && (
        <PositionHistoryRow label={t('position-history.total-fees')}>
          {formatFiatBalance(event.totalFee)} USD
        </PositionHistoryRow>
      )}
      {isOracless && 'totalFeeInQuoteToken' in event && event.totalFeeInQuoteToken && (
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
      {'repaidAssets' in event && event.repaidAssets && (
        <PositionHistoryRow label={t('position-history.sold')}>
          {formatFiatBalance(event.repaidAssets)} {collateralToken}
        </PositionHistoryRow>
      )}
      {'quoteRepaid' in event && event.quoteRepaid && (
        <PositionHistoryRow label={t('position-history.repaid')}>
          {formatFiatBalance(event.quoteRepaid)} {quoteToken}
        </PositionHistoryRow>
      )}
    </DefinitionList>
  )
}
