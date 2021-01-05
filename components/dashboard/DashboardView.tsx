// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import { Loadable } from 'helpers/loadable'
import { useObservable } from 'helpers/observableHook'
import { roundHalfUp } from 'helpers/rounding'
import { WithChildren, WithReadonlyAccount, WithTranslation } from 'helpers/types'
import { useReadonlyAccount } from 'helpers/useReadonlyAccount'
import { useTranslation } from 'i18n'
import React from 'react'
import { TRANSITIONS } from 'theme'
import { Badge, Box, Button, Card, Flex, Grid, Heading, SxStyleProp, Text } from 'theme-ui'

import { trackingEvents } from '../analytics/analytics'
import { useAppContext } from '../AppContextProvider'
import { Dashboard } from './dashboard'
import { DsrPot, getApyPercentage } from './dsrPot/dsrPot'

enum AvailableBalances {
  DAI = 'DAI',
  ETH = 'ETH',
}

interface SavingsCardProps extends WithChildren {
  sx?: SxStyleProp
}

interface SavingsProps extends WithTranslation, WithReadonlyAccount {
  dsr: Loadable<DsrPot>
}

interface BalancesItemProps {
  name: AvailableBalances
  amount: BigNumber
  amountUsd: BigNumber
  icon: JSX.Element
}

function SavingsCard({ children, sx }: SavingsCardProps) {
  return (
    <Card
      sx={{
        height: '170px',
        width: '210px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        ...sx,
      }}
    >
      <Box sx={{ variant: 'text.backgroundText' }}>{children}</Box>
    </Card>
  )
}

function Savings({ dsr, t, readonlyAccount }: SavingsProps) {
  if (dsr.status === 'loading') {
    return <SavingsCard>Loading</SavingsCard>
  }

  if (dsr.status === 'loaded') {
    const pot = dsr.value as DsrPot
    const apy = getApyPercentage(pot)

    if (!pot.proxyAddress || pot.history.length === 0) {
      return (
        <AppLink href="/pots/create" disabled={!!readonlyAccount} sx={{ display: 'inline-block' }}>
          <SavingsCard
            sx={{
              variant: 'cards.primaryWithHover',
              '&:hover': {
                borderColor: 'mutedAlt',
                boxShadow: 'surface',
                '> *': {
                  color: 'primary',
                },
              },
              ...(readonlyAccount && {
                cursor: 'default',
                borderColor: 'mutedAlt',
                boxShadow: 'surface',
              }),
            }}
          >
            {readonlyAccount ? (
              <Text sx={{ color: 'primary' }}>{t('readonly-user-no-savings')}</Text>
            ) : (
              <>
                <Text sx={{ fontSize: '49px', fontWeight: '200', mb: 2, mt: -2 }}>+</Text>
                <Text>{t('start-saving')}</Text>
              </>
            )}
          </SavingsCard>
        </AppLink>
      )
    }

    return (
      <AppLink href="/pots/[pot]" as="/pots/dsr" sx={{ display: 'inline-block' }}>
        <SavingsCard
          sx={{
            variant: 'gradients.dsr',
            border: 'none',
            cursor: 'pointer',
            transition: TRANSITIONS.global,
          }}
        >
          <Icon name="maker" size={33} color="dsrIcon" />
          <Flex sx={{ alignItems: 'center', color: 'surface', mt: 2, mb: 3 }}>
            <Icon name="dai" size={34} />
            <Text sx={{ fontSize: 7, ml: 1 }}>
              {formatCryptoBalance(roundHalfUp(pot.dai, 'DAI'))}
            </Text>
          </Flex>
          <Badge variant="dsr">
            {+apy.toFixed(2)}% {t('apy')}
          </Badge>
        </SavingsCard>
      </AppLink>
    )
  }

  return <SavingsCard>Error loading</SavingsCard>
}

// TODO: implement fetching amountUsd in pipeline
function BalancesItem({ name, amount, icon, amountUsd }: BalancesItemProps) {
  const isDai = name === AvailableBalances.DAI

  if (!isDai && amount.isZero()) {
    return null
  }

  return (
    <AppLink
      href="/balances/[token]"
      as={`/balances/${name.toLowerCase()}`}
      sx={{
        transition: TRANSITIONS.global,
        display: 'block',
        borderBottom: 'light',
        borderColor: 'muted',
        p: 3,
        '&:hover': {
          bg: 'background',
        },
        '&:first-child': { pt: 3 },
        '&:last-child': { pb: 3, borderBottom: 'none' },
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Flex sx={{ alignItems: 'center' }}>
          {icon}
          <Text
            variant="mediumHeading"
            sx={{ ml: (theme) => theme.sizingsCustom.mlDashboardToken }}
          >
            {name}
          </Text>
        </Flex>
        <Box sx={{ textAlign: 'right' }}>
          <Flex
            sx={{
              fontSize: 5,
              mb: (theme) => theme.sizingsCustom.mbDashboardTokenAmount,
              alignItems: 'center',
              color: 'primary',
            }}
          >
            {isDai && <Icon name="dai" size={20} sx={{ mr: 1 }} />}
            {formatCryptoBalance(amount)}
            {!isDai && ` ${name}`}
          </Flex>
          <Text variant="backgroundText">${formatFiatBalance(amountUsd)}</Text>
        </Box>
      </Flex>
    </AppLink>
  )
}

function Balances({ dashboard: { dai, eth, daiUSD, ethUSD } }: { dashboard: Dashboard }) {
  return (
    <Card p={0} sx={{ overflow: 'hidden' }}>
      <BalancesItem
        {...{
          name: AvailableBalances.DAI,
          amount: dai,
          amountUsd: daiUSD,
          icon: <Icon name="dai_circle_color" size={53} />,
        }}
      />
      <BalancesItem
        {...{
          name: AvailableBalances.ETH,
          amount: eth,
          amountUsd: ethUSD,
          // custom padding to properly size icon in relation to DAI one
          icon: <Icon name="ether_circle_color" size={53} sx={{ padding: 1 }} />,
        }}
      />
    </Card>
  )
}

export function DashboardView() {
  const { dashboard$ } = useAppContext()
  const dashboard = useObservable(dashboard$)
  const { readonlyAccount } = useReadonlyAccount()

  const { t } = useTranslation('common')

  if (!dashboard) {
    return null
  }

  return (
    <Grid gap={4} columns="1fr" sx={{ width: '100%' }}>
      <Box>
        <Heading as="h2" mb={3}>
          {t('savings')}
        </Heading>
        <Savings {...{ t, dsr: dashboard.pots.dsr, readonlyAccount }} />
      </Box>
      <Box>
        <Heading as="h2" mb={3}>
          {t('balances')}
        </Heading>
        <Balances {...{ dashboard }} />
      </Box>
      {!readonlyAccount && (
        <Box>
          <Heading as="h2" mb={3}>
            {t('get-dai')}
          </Heading>
          <AppLink href="/buy">
            <Button
              variant="primaryBig"
              onClick={() => {
                trackingEvents.buyDai()
              }}
            >
              <Flex sx={{ alignItems: 'center' }}>
                <Icon name="dai" size="23px" color="surface" sx={{ mr: 1 }} />
                <Text sx={{ ml: 2 }}>{t('buy-dai')}</Text>
              </Flex>
            </Button>
          </AppLink>
        </Box>
      )}
    </Grid>
  )
}
