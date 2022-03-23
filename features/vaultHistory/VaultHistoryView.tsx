import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import {
  formatAddress,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import { flatten } from 'lodash'
import moment from 'moment'
import { TFunction, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { interpolate } from '../../helpers/interpolate'
import { splitEvents, VaultHistoryEvent } from './vaultHistory'

function getHistoryEventTranslation(t: TFunction, event: VaultHistoryEvent) {
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

function MultiplyHistoryEventDetailsItem({ label, children }: { label: string } & WithChildren) {
  return (
    <Flex>
      <Text
        sx={{
          textAlign: 'right',
          minWidth: ['9.5em', null, null, '9.5em'],
          pr: [2, 3],
          color: 'text.subtitle',
        }}
      >
        {label}
      </Text>
      {children}
    </Flex>
  )
}

function MultiplyHistoryEventDetails(event: VaultHistoryEvent) {
  const { t } = useTranslation()
  const closeEvent =
    event.kind === 'CLOSE_VAULT_TO_DAI' ||
    event.kind === 'CLOSE_VAULT_TO_COLLATERAL' ||
    event.kind === 'CLOSE_GUNI_VAULT_TO_DAI'
  const guniVaultEvent = event.token.includes('GUNI')

  return (
    <Grid
      gap={2}
      sx={{
        mb: 3,
        alignItems: 'flex-start',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      }}
    >
      <Grid gap={2}>
        {event.kind === 'OPEN_MULTIPLY_VAULT' && (
          <>
            <MultiplyHistoryEventDetailsItem label={t('history.deposited')}>
              {'depositCollateral' in event && formatCryptoBalance(event.depositCollateral)}{' '}
              {event.token}
            </MultiplyHistoryEventDetailsItem>
            <MultiplyHistoryEventDetailsItem label={t('history.bought')}>
              {'bought' in event && formatCryptoBalance(event.bought)} {event.token}
            </MultiplyHistoryEventDetailsItem>
          </>
        )}
        {event.kind === 'OPEN_MULTIPLY_GUNI_VAULT' && (
          <>
            <MultiplyHistoryEventDetailsItem label={t('history.deposited')}>
              {'depositDai' in event && formatCryptoBalance(event.depositDai)} DAI
            </MultiplyHistoryEventDetailsItem>
          </>
        )}
        {event.kind === 'INCREASE_MULTIPLE' && (
          <MultiplyHistoryEventDetailsItem label={t('history.bought')}>
            {'bought' in event && formatCryptoBalance(event.bought)} {event.token}
          </MultiplyHistoryEventDetailsItem>
        )}
        {event.kind === 'INCREASE_MULTIPLE' && (
          <MultiplyHistoryEventDetailsItem label={t('history.deposited')}>
            {'depositCollateral' in event && formatCryptoBalance(event.depositCollateral)}
            {event.token}
          </MultiplyHistoryEventDetailsItem>
        )}
        {(event.kind === 'DECREASE_MULTIPLE' || closeEvent) && (
          <MultiplyHistoryEventDetailsItem label={t('history.sold')}>
            {'sold' in event && formatCryptoBalance(event.sold)}{' '}
            {guniVaultEvent ? 'USDC' : event.token}
          </MultiplyHistoryEventDetailsItem>
        )}
        {!(closeEvent && guniVaultEvent) && (
          <MultiplyHistoryEventDetailsItem label={t('system.oracle-price')}>
            {'oraclePrice' in event && '$' + formatFiatBalance(event.oraclePrice!)}
          </MultiplyHistoryEventDetailsItem>
        )}
        {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
          <MultiplyHistoryEventDetailsItem label={t('system.market-price')}>
            {'marketPrice' in event && '$' + formatFiatBalance(event.marketPrice)}
          </MultiplyHistoryEventDetailsItem>
        )}

        {!closeEvent && (
          <>
            <MultiplyHistoryEventDetailsItem label={t('system.collateral')}>
              {'beforeLockedCollateral' in event &&
                event.beforeLockedCollateral.gt(0) &&
                formatCryptoBalance(event.beforeLockedCollateral) + `->`}
              {'lockedCollateral' in event && formatCryptoBalance(event.lockedCollateral)}{' '}
              {event.token}
            </MultiplyHistoryEventDetailsItem>
            <MultiplyHistoryEventDetailsItem label={t('multiple')}>
              {'beforeMultiple' in event &&
                event.beforeMultiple.gt(0) &&
                formatCryptoBalance(event.beforeMultiple) + `x` + `->`}
              {'multiple' in event && event.multiple.gt(zero)
                ? `${event.multiple.toFixed(2)}x`
                : '-'}
            </MultiplyHistoryEventDetailsItem>
          </>
        )}
        {(event.kind === 'CLOSE_VAULT_TO_DAI' || event.kind === 'CLOSE_GUNI_VAULT_TO_DAI') && (
          <MultiplyHistoryEventDetailsItem label={t('history.exit-dai')}>
            {'exitDai' in event && formatCryptoBalance(event.exitDai)} DAI
          </MultiplyHistoryEventDetailsItem>
        )}
        {event.kind === 'CLOSE_VAULT_TO_COLLATERAL' && (
          <MultiplyHistoryEventDetailsItem label={t('history.exit-collateral')}>
            {'exitCollateral' in event && formatCryptoBalance(event.exitCollateral)} {event.token}
          </MultiplyHistoryEventDetailsItem>
        )}
      </Grid>
      <Grid gap={2}>
        <MultiplyHistoryEventDetailsItem label={t('outstanding-debt')}>
          {'beforeDebt' in event &&
            event.beforeDebt.gt(0) &&
            formatCryptoBalance(event.beforeDebt.times(event.rate)) + `DAI` + `->`}
          {'debt' in event && formatCryptoBalance(event.debt.times(event.rate))} DAI
        </MultiplyHistoryEventDetailsItem>
        {!closeEvent && (
          <>
            {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
              <MultiplyHistoryEventDetailsItem label={t('system.coll-ratio')}>
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
              </MultiplyHistoryEventDetailsItem>
            )}
            <MultiplyHistoryEventDetailsItem label={t('net-value')}>
              {'netValue' in event && '$' + formatFiatBalance(event.netValue)}
            </MultiplyHistoryEventDetailsItem>
            {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
              <MultiplyHistoryEventDetailsItem label={t('system.liquidation-price')}>
                {'beforeLiquidationPrice' in event &&
                  event.beforeLiquidationPrice.gt(0) &&
                  `$` + formatFiatBalance(event.beforeLiquidationPrice) + `->`}
                {'liquidationPrice' in event && '$' + formatFiatBalance(event.liquidationPrice)}
              </MultiplyHistoryEventDetailsItem>
            )}
          </>
        )}
        <MultiplyHistoryEventDetailsItem label={t('history.total-fees')}>
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
        </MultiplyHistoryEventDetailsItem>
      </Grid>
    </Grid>
  )
}

function VaultHistoryItem({
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
    <Card
      sx={{
        borderRadius: 'mediumLarge',
        border: 'lightMuted',
        boxShadow: 'vaultHistoryItem',
        fontSize: 2,
        display: 'grid',
        p: [2, 3],
        minWidth: ['100%', '400px', '475px'],
      }}
    >
      <Box sx={{ p: [1, 2], cursor: 'pointer' }} onClick={() => setOpened(!opened)}>
        <Flex
          sx={{
            justifyContent: 'space-between',
            alignItems: ['flex-start', null, null, 'center'],
            width: '100%',
          }}
        >
          <Flex
            sx={{
              justifyContent: 'space-between',
              flex: 1,
              gap: [1, 3],
              flexDirection: ['column', null, null, 'row'],
            }}
          >
            <Text sx={{ fontWeight: 'semiBold' }}>
              {interpolate(translation, {
                0: ({ children }) => <Text as="span">{children}</Text>,
              })}
            </Text>
            <Text
              sx={{ color: 'text.subtitle', whiteSpace: 'nowrap', mr: 2, fontWeight: 'medium' }}
            >
              {date.format('MMM DD, YYYY, h:mma')}
            </Text>
          </Flex>
          <Icon
            name={`chevron_${opened ? 'up' : 'down'}`}
            size="auto"
            width="12px"
            height="7px"
            color="text.subtitle"
            sx={{ position: 'relative', top: ['5px', null, null, '0px'] }}
          />
        </Flex>
      </Box>
      {opened && (
        <Box p={[1, 2]}>
          {isMultiplyEvent && <MultiplyHistoryEventDetails {...item} />}
          <Flex>
            <AppLink sx={{ textDecoration: 'none' }} href={`${etherscan?.url}/tx/${item.hash}`}>
              <WithArrow sx={{ color: 'link', mr: 4, fontWeight: 'semiBold' }}>
                {t('view-on-etherscan')}
              </WithArrow>
            </AppLink>
            {ethtx && (
              <AppLink
                sx={{ textDecoration: 'none', fontWeight: 'semiBold' }}
                href={`${ethtx.url}/${item.hash}`}
              >
                <WithArrow sx={{ color: 'link', fontWeight: 'semiBold' }}>
                  {t('view-on-ethtx')}
                </WithArrow>
              </AppLink>
            )}
          </Flex>
        </Box>
      )}
    </Card>
  )
}

export function VaultHistoryView({ vaultHistory }: { vaultHistory: VaultHistoryEvent[] }) {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)
  const { t } = useTranslation()

  const spitedEvents = flatten(vaultHistory.map(splitEvents))

  return (
    <Box>
      <Heading variant="header3" sx={{ mb: [4, 3] }}>
        {t('vault-history')}
      </Heading>
      <Grid gap={2}>
        {spitedEvents.map((item) => (
          <VaultHistoryItem
            item={item}
            etherscan={context?.etherscan}
            ethtx={context?.ethtx}
            key={`${item.id}${`-${item.splitId}` || ''}`}
          />
        ))}
      </Grid>
    </Box>
  )
}
