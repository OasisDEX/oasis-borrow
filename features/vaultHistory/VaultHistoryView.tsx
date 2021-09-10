import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { formatAddress, formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { TFunction, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { interpolate } from '../../helpers/interpolate'
import { VaultHistoryEvent } from './vaultHistory'

function getHistoryEventTranslation(t: TFunction, event: VaultHistoryEvent) {
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

function MultiplyHistoryEventDetailsItem({
  label,
  children,
  rightItem,
}: { label: string; rightItem?: boolean } & WithChildren) {
  return (
    <Flex>
      <Text
        sx={{
          textAlign: 'right',
          minWidth: ['9.5em', null, null, rightItem ? '9.5em' : '6em'],
          pr: 3,
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

  return (
    <Flex
      sx={{
        mb: 3,
        maxWidth: '460px',
        justifyContent: 'space-between',
        flexDirection: ['column', null, null, 'row'],
      }}
    >
      <Grid
        gap={2}
        sx={{
          mr: [0, null, null, 4],
          mb: [2, null, null, 0],
        }}
      >
        <MultiplyHistoryEventDetailsItem label={t('amount')}>
          {'collateralAmount' in event && formatCryptoBalance(event.collateralAmount)} {event.token}
        </MultiplyHistoryEventDetailsItem>
        <MultiplyHistoryEventDetailsItem label={t('price')}>
          {'oraclePrice' in event && '$' + formatFiatBalance(event.oraclePrice)}
        </MultiplyHistoryEventDetailsItem>
        <MultiplyHistoryEventDetailsItem label={t('system.collateral')}>
          {'collateralTotal' in event && formatCryptoBalance(event.collateralTotal)} {event.token}
        </MultiplyHistoryEventDetailsItem>
        <MultiplyHistoryEventDetailsItem label={t('multiple')}>
          {'multiple' in event && event.multiple.gt(zero) ? `${event.multiple.toFixed(2)}x` : '-'}
        </MultiplyHistoryEventDetailsItem>
      </Grid>
      <Grid gap={2}>
        <MultiplyHistoryEventDetailsItem rightItem label={t('outstanding-debt')}>
          {'outstandingDebt' in event && formatCryptoBalance(event.outstandingDebt)} DAI
        </MultiplyHistoryEventDetailsItem>
        <MultiplyHistoryEventDetailsItem rightItem label={t('net-value')}>
          {'netValueUSD' in event && '$' + formatFiatBalance(event.netValueUSD)}
        </MultiplyHistoryEventDetailsItem>
        <MultiplyHistoryEventDetailsItem rightItem label={t('system.liquidation-price')}>
          {'liquidationPrice' in event && '$' + formatFiatBalance(event.liquidationPrice)}
        </MultiplyHistoryEventDetailsItem>
        <MultiplyHistoryEventDetailsItem rightItem label={t('fees')}>
          {'fees' in event && event.fees.gt(zero) ? '$' + formatFiatBalance(event.fees) : '-'}
        </MultiplyHistoryEventDetailsItem>
      </Grid>
    </Flex>
  )
}

function VaultHistoryItem({
  item,
  etherscan,
}: {
  item: VaultHistoryEvent
  etherscan?: { url: string }
}) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const translation = getHistoryEventTranslation(t, item)
  const date = moment(item.timestamp)

  return (
    <Card
      sx={{
        borderRadius: 'mediumLarge',
        border: 'lightMuted',
        boxShadow: 'vaultHistoryItem',
        fontSize: 2,
        display: item.isHidden ? 'none' : 'grid',
      }}
    >
      <Box sx={{ p: 2, cursor: 'pointer' }} onClick={() => setOpened(!opened)}>
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
        <Box p={2}>
          {item.isMultiply && <MultiplyHistoryEventDetails {...item} />}
          <AppLink
            variant="links.navFooter"
            sx={{ fontSize: 2 }}
            href={`${etherscan?.url}/tx/${item.hash}`}
          >
            {t('view-on-etherscan')}
          </AppLink>
        </Box>
      )}
    </Card>
  )
}

export function VaultHistoryView({ vaultHistory }: { vaultHistory: VaultHistoryEvent[] }) {
  const { context$ } = useAppContext()
  const context = useObservable(context$)
  const { t } = useTranslation()

  return (
    <Box>
      <Heading variant="header3" sx={{ mb: [4, 3] }}>
        {t('vault-history')}
      </Heading>
      <Grid gap={2}>
        {vaultHistory.map((item) => (
          <VaultHistoryItem item={item} etherscan={context?.etherscan} key={item.id} />
        ))}
      </Grid>
    </Box>
  )
}
