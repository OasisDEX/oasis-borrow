import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
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
      }}
    >
      <Box sx={{ p: 2, cursor: 'pointer' }} onClick={() => setOpened(!opened)}>
        <Flex
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Text sx={{ fontWeight: 'semiBold' }}>
            {interpolate(translation, {
              0: ({ children }) => <Text as="span">{children}</Text>,
            })}
          </Text>
          <Flex sx={{ color: 'text.subtitle', alignItems: ' center' }}>
            <Text sx={{ whiteSpace: 'nowrap', mr: 2, fontWeight: 'medium' }}>
              {date.format('MMM DD, YYYY, h:mma')}
            </Text>
            <Icon
              name={`chevron_${opened ? 'up' : 'down'}`}
              size="auto"
              width="12px"
              height="7px"
            />
          </Flex>
        </Flex>
      </Box>
      {opened && (
        <Box p={2}>
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
      <Heading variant="header3" sx={{ mb: 3 }}>
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
