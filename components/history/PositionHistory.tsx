import { Icon } from '@makerdao/dai-ui-icons'
import { normalizeValue } from '@oasisdex/dma-library'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useAppContext } from 'components/AppContextProvider'
import { DefinitionList, DefinitionListItem } from 'components/DefinitionList'
import { AppLink } from 'components/Links'
import { Skeleton } from 'components/Skeleton'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import { WithArrow } from 'components/WithArrow'
import {
  AaveHistoryEvent,
  AjnaHistoryEvent,
} from 'features/ajna/positions/common/helpers/getAjnaHistory'
import { getHistoryEventLabel } from 'features/positionHistory/getHistoryEventLabel'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatFiatBalance,
} from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { FC, useState } from 'react'
import { Box, Card, Flex, Heading, Text } from 'theme-ui'

interface PositionHistoryRowProps {
  label: string
}

const PositionHistoryRow: FC<PositionHistoryRowProps> = ({ label, children }) => {
  return (
    <DefinitionListItem sx={{ display: 'flex', justifyContent: 'space-between', pl: 3, pr: 2 }}>
      <Text
        as="span"
        sx={{
          color: 'neutral80',
          pr: 2,
        }}
      >
        {label}
      </Text>
      <Text
        as="span"
        sx={{
          flexShrink: 0,
          color: 'primary100',
        }}
      >
        {children}
      </Text>
    </DefinitionListItem>
  )
}

interface PositionHistoryItemDetailsProps {
  event: Partial<AjnaHistoryEvent> | Partial<AaveHistoryEvent>
  collateralToken: string
  quoteToken: string
  isShort?: boolean
  priceFormat?: string
}

const PositionHistoryItemDetails: FC<PositionHistoryItemDetailsProps> = ({
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

interface PositionHistoryItemProps {
  item: Partial<AjnaHistoryEvent>
  ethtxUrl: string
  etherscanUrl: string
  collateralToken: string
  quoteToken: string
  isShort?: boolean
  priceFormat?: string
}

const PositionHistoryItem: FC<PositionHistoryItemProps> = ({
  item,
  ethtxUrl,
  etherscanUrl,
  collateralToken,
  quoteToken,
  isShort,
  priceFormat,
}) => {
  const [opened, setOpened] = useState(false)
  const { t } = useTranslation()

  const humanDate = new Date(item.timestamp!).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  return (
    <DefinitionListItem sx={{ fontSize: 2, position: 'relative' }}>
      <Flex
        sx={{
          flexDirection: ['column', null, null, 'row'],
          justifyContent: 'space-between',
          alignItems: ['flex-start', null, null, 'center'],
          width: '100%',
          pb: opened ? 3 : 0,
          pl: 2,
          pr: 4,
          fontSize: 2,
          cursor: 'pointer',
        }}
        onClick={() => setOpened(!opened)}
      >
        <Text as="p" sx={{ fontWeight: 'semiBold', color: 'primary100' }}>
          {getHistoryEventLabel({ kind: item.kind, isOpen: item.isOpen })}
        </Text>
        <Text as="time" sx={{ color: 'neutral80', whiteSpace: 'nowrap', fontWeight: 'semiBold' }}>
          {humanDate}
        </Text>
        <Icon
          name={`chevron_${opened ? 'up' : 'down'}`}
          size="auto"
          width="12px"
          height="7px"
          color="neutral80"
          sx={{ position: 'absolute', top: '24px', right: 2 }}
        />
      </Flex>
      {opened && (
        <Box sx={{ pb: 3 }}>
          <PositionHistoryItemDetails
            event={item}
            isShort={isShort}
            priceFormat={priceFormat}
            quoteToken={quoteToken}
            collateralToken={collateralToken}
          />
          <Flex
            sx={{
              flexDirection: ['column', null, null, 'row'],
              pr: 2,
              pt: 3,
              pl: 3,
            }}
          >
            <AppLink sx={{ textDecoration: 'none' }} href={`${etherscanUrl}/tx/${item.txHash}`}>
              <WithArrow
                sx={{
                  color: 'interactive100',
                  mr: 4,
                  mb: [1, null, null, 0],
                  fontSize: 1,
                  fontWeight: 'semiBold',
                }}
              >
                {t('view-on-etherscan')}
              </WithArrow>
            </AppLink>
            <AppLink sx={{ textDecoration: 'none' }} href={`${ethtxUrl}/${item.txHash}`}>
              <WithArrow sx={{ color: 'interactive100', fontSize: 1, fontWeight: 'semiBold' }}>
                {t('view-on-ethtx')}
              </WithArrow>
            </AppLink>
          </Flex>
        </Box>
      )}
    </DefinitionListItem>
  )
}

interface PositionHistoryProps {
  historyEvents: Partial<AjnaHistoryEvent>[] | Partial<AaveHistoryEvent>[]
  collateralToken: string
  quoteToken: string
  isShort?: boolean
  priceFormat?: string
}

export const PositionHistory: FC<PositionHistoryProps> = ({
  historyEvents,
  quoteToken,
  collateralToken,
  isShort = false,
  priceFormat,
}) => {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)

  const { t } = useTranslation()
  return !context ? (
    <Skeleton height="440px" />
  ) : (
    <Card
      sx={{
        p: 4,
        border: 'lightMuted',
      }}
    >
      <Heading variant="headerSettings" sx={{ mb: 3 }}>
        {t('position-history.header')}
      </Heading>
      <DefinitionList>
        {historyEvents.map((item) => (
          <PositionHistoryItem
            item={item}
            etherscanUrl={getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan.url}
            ethtxUrl={getNetworkContracts(NetworkIds.MAINNET, context.chainId).ethtx.url}
            key={`${item.id}-${item.txHash}`}
            isShort={isShort}
            priceFormat={priceFormat}
            quoteToken={quoteToken}
            collateralToken={collateralToken}
          />
        ))}
      </DefinitionList>
    </Card>
  )
}
