import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { DefinitionList, DefinitionListItem } from 'components/DefinitionList'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import {
  formatAddress,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { interpolate } from 'helpers/interpolate'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { TFunction, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'

import { VaultHistoryEvent } from './vaultHistory'

export function getHistoryEventTranslation(t: TFunction, event: VaultHistoryEvent) {
  if ('triggerId' in event) {
    return `${t(`history.${event.kind}`)} ${t(`triggers.${event.eventType}`)}`
  }

  return t(`history.${event.kind.toLowerCase()}`, {
    transferTo: 'transferTo' in event && formatAddress(event.transferTo),
    transferFrom: 'transferFrom' in event && formatAddress(event.transferFrom),
    collateralAmount:
      'collateralAmount' in event && event.collateralAmount
        ? formatCryptoBalance(event.collateralAmount.abs())
        : 0,
    daiAmount: 'daiAmount' in event ? formatCryptoBalance(event.daiAmount.abs()) : 0,
    remainingCollateral:
      'remainingCollateral' in event && event.remainingCollateral
        ? formatCryptoBalance(event.remainingCollateral)
        : 0,
    collateralTaken:
      'collateralTaken' in event && event.collateralTaken
        ? formatCryptoBalance(event.collateralTaken)
        : 0,
    coveredDebt:
      'coveredDebt' in event && event.coveredDebt ? formatCryptoBalance(event.coveredDebt) : 0,
    cdpId: 'cdpId' in event ? event.cdpId : undefined,
    auctionId: 'auctionId' in event ? event.auctionId : undefined,
    token: event.token,
  })
}

function VaultHistoryEntryDetailsItem({ label, children }: { label: string } & WithChildren) {
  return (
    <DefinitionListItem sx={{ display: 'flex', justifyContent: 'space-between', pl: 3, pr: 2 }}>
      <Text
        as="span"
        sx={{
          color: 'text.subtitle',
          pr: 2,
        }}
      >
        {label}
      </Text>
      <Text
        as="span"
        sx={{
          flexShrink: 0,
          color: 'primary',
        }}
      >
        {children}
      </Text>
    </DefinitionListItem>
  )
}

function VaultHistoryEntryDetails(event: VaultHistoryEvent) {
  const { t } = useTranslation()
  const closeEvent =
    event.kind === 'CLOSE_VAULT_TO_DAI' ||
    event.kind === 'CLOSE_VAULT_TO_COLLATERAL' ||
    event.kind === 'CLOSE_GUNI_VAULT_TO_DAI'
  const guniVaultEvent = event.token.includes('GUNI')

  return (
    <DefinitionList>
      {event.kind === 'OPEN_MULTIPLY_VAULT' && (
        <>
          <VaultHistoryEntryDetailsItem label={t('history.deposited')}>
            {'depositCollateral' in event && formatCryptoBalance(event.depositCollateral)}{' '}
            {event.token}
          </VaultHistoryEntryDetailsItem>
          <VaultHistoryEntryDetailsItem label={t('history.bought')}>
            {'bought' in event && formatCryptoBalance(event.bought)} {event.token}
          </VaultHistoryEntryDetailsItem>
        </>
      )}
      {event.kind === 'OPEN_MULTIPLY_GUNI_VAULT' && (
        <>
          <VaultHistoryEntryDetailsItem label={t('history.deposited')}>
            {'depositDai' in event && formatCryptoBalance(event.depositDai)} DAI
          </VaultHistoryEntryDetailsItem>
        </>
      )}
      {event.kind === 'INCREASE_MULTIPLE' && (
        <VaultHistoryEntryDetailsItem label={t('history.bought')}>
          {'bought' in event && formatCryptoBalance(event.bought)} {event.token}
        </VaultHistoryEntryDetailsItem>
      )}
      {event.kind === 'INCREASE_MULTIPLE' && (
        <VaultHistoryEntryDetailsItem label={t('history.deposited')}>
          {'depositCollateral' in event && formatCryptoBalance(event.depositCollateral)}
          {event.token}
        </VaultHistoryEntryDetailsItem>
      )}
      {(event.kind === 'DECREASE_MULTIPLE' || closeEvent) && (
        <VaultHistoryEntryDetailsItem label={t('history.sold')}>
          {'sold' in event && formatCryptoBalance(event.sold)}{' '}
          {guniVaultEvent ? 'USDC' : event.token}
        </VaultHistoryEntryDetailsItem>
      )}
      {!(closeEvent && guniVaultEvent) && (
        <VaultHistoryEntryDetailsItem label={t('system.oracle-price')}>
          {'oraclePrice' in event && '$' + formatFiatBalance(event.oraclePrice!)}
        </VaultHistoryEntryDetailsItem>
      )}
      {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
        <VaultHistoryEntryDetailsItem label={t('system.market-price')}>
          {'marketPrice' in event && '$' + formatFiatBalance(event.marketPrice)}
        </VaultHistoryEntryDetailsItem>
      )}

      {!closeEvent && (
        <>
          <VaultHistoryEntryDetailsItem label={t('system.collateral')}>
            {'beforeLockedCollateral' in event &&
              event.beforeLockedCollateral.gt(0) &&
              formatCryptoBalance(event.beforeLockedCollateral) + `->`}
            {'lockedCollateral' in event && formatCryptoBalance(event.lockedCollateral)}{' '}
            {event.token}
          </VaultHistoryEntryDetailsItem>
          <VaultHistoryEntryDetailsItem label={t('multiple')}>
            {'beforeMultiple' in event &&
              event.beforeMultiple.gt(0) &&
              formatCryptoBalance(event.beforeMultiple) + `x` + `->`}
            {'multiple' in event && event.multiple.gt(zero) ? `${event.multiple.toFixed(2)}x` : '-'}
          </VaultHistoryEntryDetailsItem>
        </>
      )}
      {(event.kind === 'CLOSE_VAULT_TO_DAI' || event.kind === 'CLOSE_GUNI_VAULT_TO_DAI') && (
        <VaultHistoryEntryDetailsItem label={t('history.exit-dai')}>
          {'exitDai' in event && formatCryptoBalance(event.exitDai)} DAI
        </VaultHistoryEntryDetailsItem>
      )}
      {event.kind === 'CLOSE_VAULT_TO_COLLATERAL' && (
        <VaultHistoryEntryDetailsItem label={t('history.exit-collateral')}>
          {'exitCollateral' in event && formatCryptoBalance(event.exitCollateral)} {event.token}
        </VaultHistoryEntryDetailsItem>
      )}
      <VaultHistoryEntryDetailsItem label={t('outstanding-debt')}>
        {'beforeDebt' in event &&
          event.beforeDebt.gt(0) &&
          formatCryptoBalance(event.beforeDebt.times(event.rate)) + `DAI` + `->`}
        {'debt' in event && formatCryptoBalance(event.debt.times(event.rate))} DAI
      </VaultHistoryEntryDetailsItem>
      {!closeEvent && (
        <>
          {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
            <VaultHistoryEntryDetailsItem label={t('system.coll-ratio')}>
              {'beforeCollateralizationRatio' in event &&
                event.beforeCollateralizationRatio.gt(0) &&
                formatPercent(event.beforeCollateralizationRatio.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                }) + `->`}
              {'collateralizationRatio' in event &&
                formatPercent(event.collateralizationRatio.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
            </VaultHistoryEntryDetailsItem>
          )}
          <VaultHistoryEntryDetailsItem label={t('net-value')}>
            {'netValue' in event && '$' + formatFiatBalance(event.netValue)}
          </VaultHistoryEntryDetailsItem>
          {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
            <VaultHistoryEntryDetailsItem label={t('system.liquidation-price')}>
              {'beforeLiquidationPrice' in event &&
                event.beforeLiquidationPrice.gt(0) &&
                `$` + formatFiatBalance(event.beforeLiquidationPrice) + `->`}
              {'liquidationPrice' in event && '$' + formatFiatBalance(event.liquidationPrice)}
            </VaultHistoryEntryDetailsItem>
          )}
        </>
      )}
      <VaultHistoryEntryDetailsItem label={t('history.total-fees')}>
        {'totalFee' in event &&
        'gasFee' in event &&
        (event.totalFee.gt(zero) || event.gasFee.gt(zero))
          ? '$' +
            formatFiatBalance(
              BigNumber.sum(
                event.totalFee,
                amountFromWei(event.gasFee || zero, 'ETH').times(event.ethPrice),
              ),
            )
          : '-'}
      </VaultHistoryEntryDetailsItem>
    </DefinitionList>
  )
}

export function VaultHistoryEntry({
  item,
  etherscan,
  ethtx,
}: {
  item: VaultHistoryEvent
  etherscan?: { url: string }
  ethtx?: { url: string }
}) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const translation = getHistoryEventTranslation(t, item)
  const date = moment(item.timestamp)

  const isMultiplyEvent =
    item.kind === 'OPEN_MULTIPLY_VAULT' ||
    item.kind === 'OPEN_MULTIPLY_GUNI_VAULT' ||
    item.kind === 'INCREASE_MULTIPLE' ||
    item.kind === 'DECREASE_MULTIPLE' ||
    item.kind === 'CLOSE_VAULT_TO_DAI' ||
    item.kind === 'CLOSE_GUNI_VAULT_TO_DAI' ||
    item.kind === 'CLOSE_VAULT_TO_COLLATERAL'

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
        <Text as="p" sx={{ fontWeight: 'semiBold', color: 'primary' }}>
          {interpolate(translation, {
            0: ({ children }) => <Text as="span">{children}</Text>,
          })}
        </Text>
        <Text
          as="time"
          sx={{ color: 'text.subtitle', whiteSpace: 'nowrap', fontWeight: 'semiBold' }}
        >
          {date.format('MMM DD, YYYY, h:mma')}
        </Text>
        <Icon
          name={`chevron_${opened ? 'up' : 'down'}`}
          size="auto"
          width="12px"
          height="7px"
          color="text.subtitle"
          sx={{ position: 'absolute', top: '24px', right: 2 }}
        />
      </Flex>
      {opened && (
        <Box sx={{ pb: 3 }}>
          {isMultiplyEvent && <VaultHistoryEntryDetails {...item} />}
          <Flex
            sx={{
              flexDirection: ['column', null, null, 'row'],
              pr: 2,
              pt: 3,
              pl: 3,
            }}
          >
            <AppLink sx={{ textDecoration: 'none' }} href={`${etherscan?.url}/tx/${item.hash}`}>
              <WithArrow
                sx={{
                  color: 'link',
                  mr: 4,
                  mb: [1, null, null, 0],
                  fontSize: 1,
                  fontWeight: 'semiBold',
                }}
              >
                {t('view-on-etherscan')}
              </WithArrow>
            </AppLink>
            {ethtx && (
              <AppLink sx={{ textDecoration: 'none' }} href={`${ethtx.url}/${item.hash}`}>
                <WithArrow sx={{ color: 'link', fontSize: 1, fontWeight: 'semiBold' }}>
                  {t('view-on-ethtx')}
                </WithArrow>
              </AppLink>
            )}
          </Flex>
        </Box>
      )}
    </DefinitionListItem>
  )
}
