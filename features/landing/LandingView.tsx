import { Icon } from '@makerdao/dai-ui-icons'
import { Pages, trackingEvents } from 'analytics/analytics'
import { getToken } from 'blockchain/tokensMetadata'
import { WelcomeAnnouncement } from 'components/Announcement'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { IlksFilterState, TagFilter } from 'features/ilks/popularIlksFilters'
import { FiltersWithPopular } from 'features/landing/FiltersWithPopular'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable, useObservableWithError } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans, useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import React, { ComponentProps, useCallback } from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'
import { fadeInAnimation, slideInAnimation } from 'theme/animations'

import { FeaturedIlks, FeaturedIlksPlaceholder } from './FeaturedIlks'

const {
  publicRuntimeConfig: { apiHost },
} = getConfig()

export function TokenSymbol({
  token,
  displaySymbol,
  ...props
}: { token: string; displaySymbol?: boolean } & Omit<ComponentProps<typeof Icon>, 'name'>) {
  const tokenInfo = getToken(token)

  return (
    <Flex>
      <Icon
        name={tokenInfo.iconCircle}
        size="26px"
        sx={{ verticalAlign: 'sub', mr: 2 }}
        {...props}
      />
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', whiteSpace: 'nowrap' }}>
        {tokenInfo[displaySymbol ? 'symbol' : 'name']}
      </Text>
    </Flex>
  )
}

const ilksColumns: ColumnDef<IlkWithBalance, IlksFilterState>[] = [
  {
    headerLabel: 'system.asset',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ token }) => <TokenSymbol token={token} />,
  },
  {
    headerLabel: 'system.type',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ ilk }) => <Text>{ilk}</Text>,
  },
  {
    headerLabel: 'system.dai-available',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="ilkDebtAvailable">
        {label}
      </TableSortHeader>
    ),
    cell: ({ ilkDebtAvailable }) => (
      <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(ilkDebtAvailable)}</Text>
    ),
  },
  {
    headerLabel: 'system.stability-fee',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="stabilityFee">
        {label}
      </TableSortHeader>
    ),
    cell: ({ stabilityFee }) => (
      <Text sx={{ textAlign: 'right' }}>
        {formatPercent(stabilityFee.times(100), { precision: 2 })}
      </Text>
    ),
  },
  {
    headerLabel: 'system.min-coll-ratio',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="liquidationRatio">
        {label}
      </TableSortHeader>
    ),
    cell: ({ liquidationRatio }) => (
      <Text sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio.times(100))}</Text>
    ),
  },
  {
    headerLabel: '',
    header: () => null,
    cell: ({ ilk, ilkDebtAvailable }) => (
      <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
        <AppLink
          sx={{ width: ['100%', 'inherit'], textAlign: 'center', maxWidth: ['100%', '150px'] }}
          variant="secondary"
          href={`/vaults/open/${ilk}`}
          disabled={ilkDebtAvailable.isZero()}
        >
          {!ilkDebtAvailable.isZero() ? (
            <Trans i18nKey="open-vault.title" />
          ) : (
            <Button
              variant="secondary"
              disabled={true}
              sx={{ width: '100%', maxWidth: ['100%', '150px'] }}
            >
              <Text>
                <Trans i18nKey="no-dai" />
              </Text>
            </Button>
          )}
        </AppLink>
      </Box>
    ),
  },
]

export function Hero({ sx, isConnected }: { sx?: SxStyleProp; isConnected: boolean }) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        ...sx,
        justifySelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        my: 5,
        flexDirection: 'column',
      }}
    >
      <WelcomeAnnouncement />
      <Heading as="h1" variant="header1" sx={{ mb: 3 }}>
        {t('landing.hero.headline')}
      </Heading>
      <Text variant="paragraph1" sx={{ mb: 4, color: 'lavender' }}>
        <Trans i18nKey="landing.hero.subheader" components={[<br />]} />
      </Text>
      <Image sx={{ mb: 4 }} src={staticFilesRuntimeUrl('/static/img/icons_set.svg')} />
      {!isConnected && (
        <AppLink
          href="/connect"
          variant="primary"
          sx={{
            display: 'flex',
            margin: '0 auto',
            px: '40px',
            py: 2,
            alignItems: 'center',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
          }}
        >
          {t('connect-wallet')}
          <Icon
            name="arrow_right"
            sx={{
              ml: 2,
              position: 'relative',
              left: 2,
              transition: '0.2s',
            }}
          />
        </AppLink>
      )}
    </Flex>
  )
}

function LandingCard({ href, cardKey }: { href: string; cardKey: 'dai' | 'faq' }) {
  const { t } = useTranslation()

  return (
    <AppLink href={href} sx={{ display: 'flex' }} target="_self">
      <Card sx={{ p: [3, 4], boxShadow: 'cardLanding', border: 'none', borderRadius: 'large' }}>
        <Flex sx={{ py: 3, px: [2, 0] }}>
          <Flex sx={{ mr: [3, 4], width: ['70px', '88px'], height: ['70px', '88px'] }}>
            <Icon name={`landing_card_${cardKey}`} size="auto" width="100%" height="100%" />
          </Flex>
          <Box sx={{ color: 'primary', flex: 1 }}>
            <Heading mb={3} sx={{ fontWeight: 'semiBold' }}>
              {t(`landing.cards.${cardKey}.title`)}
            </Heading>
            <Text variant="paragraph2">{t(`landing.cards.${cardKey}.description`)}</Text>
          </Box>
        </Flex>
      </Card>
    </AppLink>
  )
}

function LandingCards() {
  return (
    <Grid
      columns={[1, null, 2]}
      gap={4}
      sx={{
        maxWidth: ['460px', null, '992px'],
        mx: 'auto',
        my: 5,
        py: 4,
      }}
    >
      <LandingCard href={`${apiHost}/daiwallet`} cardKey="dai" target="_self" />
      <LandingCard href="/support" cardKey="faq" />
    </Grid>
  )
}

export function LandingView() {
  const { landing$, context$ } = useAppContext()
  const context = useObservable(context$)
  const { value: landing, error: landingError } = useObservableWithError(landing$)
  const { t } = useTranslation()

  const onIlkSearch = useCallback(
    (search: string) => {
      landing?.ilks.filters.change({ kind: 'search', search })
    },
    [landing?.ilks.filters],
  )
  const onIlksTagChange = useCallback(
    (tagFilter: TagFilter) => {
      landing?.ilks.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [landing?.ilks.filters],
  )

  return (
    <Grid
      sx={{
        flex: 1,
        position: 'relative',
      }}
    >
      <Hero
        isConnected={context?.status === 'connected'}
        sx={{ ...slideInAnimation, position: 'relative' }}
      />
      <Box
        sx={{
          ...slideInAnimation,
          position: 'relative',
          my: 4,
          mb: [2, 3, 5],
        }}
      >
        <FeaturedIlksPlaceholder
          sx={
            landing !== undefined
              ? {
                  ...fadeInAnimation,
                  animationDirection: 'backwards',
                  animationFillMode: 'backwards',
                }
              : {}
          }
        />
        {landing !== undefined && <FeaturedIlks sx={fadeInAnimation} ilks={landing.featuredIlks} />}
      </Box>
      <WithLoadingIndicator
        value={landing}
        error={landingError}
        customLoader={
          <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
            <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
          </Flex>
        }
      >
        {(landing) => (
          <Box sx={{ ...slideInAnimation, position: 'relative' }}>
            <FiltersWithPopular
              onSearch={onIlkSearch}
              search={landing.ilks.filters.search}
              onTagChange={onIlksTagChange}
              tagFilter={landing.ilks.filters.tagFilter}
              defaultTag="all-assets"
              page={Pages.LandingPage}
              searchPlaceholder={t('search-token')}
            />
            <Box sx={{ overflowX: 'auto', p: '3px' }}>
              <Table
                data={landing.ilks.data}
                primaryKey="ilk"
                state={landing.ilks.filters}
                columns={ilksColumns}
                noResults={<Box>{t('no-results')}</Box>}
                deriveRowProps={(row) => ({
                  href: row.ilkDebtAvailable.isZero() ? undefined : `/vaults/open/${row.ilk}`,
                  onClick: () => trackingEvents.openVault(Pages.LandingPage, row.ilk),
                })}
              />
            </Box>
          </Box>
        )}
      </WithLoadingIndicator>
      <LandingCards />
    </Grid>
  )
}
