import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { Table } from 'components/Table'
import { FeaturedIlks } from 'features/vaultsOverview/VaultsOverviewView'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'i18n'
import React, { ComponentProps } from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

export function TokenSymbol({
  token,
  ...props
}: { token: string } & Omit<ComponentProps<typeof Icon>, 'name'>) {
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
        {tokenInfo.name}
      </Text>
    </Flex>
  )
}

export function LandingView() {
  const { landing$ } = useAppContext()
  const { t } = useTranslation()
  const landing = useObservable(landing$)

  if (landing === undefined) {
    return null
  }

  return (
    <Grid sx={{ flex: 1 }}>
      <Box sx={{ width: '600px', justifySelf: 'center', textAlign: 'center', my: 4 }}>
        <Heading as="h1" sx={{ fontSize: 7, my: 3 }}>
          {t('landing.hero.headline')}
        </Heading>
        <Text>{t('landing.hero.subheader')}</Text>
      </Box>
      <Box sx={{ my: 4 }}>
        <FeaturedIlks ilks={landing.featuredIlks} />
      </Box>
      <Table
        data={landing.rows}
        primaryKey="ilk"
        rowDefinition={[
          {
            header: <Text>{t('system.asset')}</Text>,
            cell: ({ token }) => <TokenSymbol token={token} />,
          },
          {
            header: <Text>{t('system.type')}</Text>,
            cell: ({ ilk }) => <Text>{ilk}</Text>,
          },
          {
            header: <Text sx={{ textAlign: 'right' }}>{t('system.dai-available')}</Text>,
            cell: ({ ilkDebtAvailable }) => (
              <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(ilkDebtAvailable)}</Text>
            ),
          },
          {
            header: <Text sx={{ textAlign: 'right' }}>{t('system.stability-fee')}</Text>,
            cell: ({ stabilityFee }) => (
              <Text sx={{ textAlign: 'right' }}>{formatPercent(stabilityFee)}</Text>
            ),
          },
          {
            header: <Text sx={{ textAlign: 'right' }}>{t('system.min-coll-ratio')}</Text>,
            cell: ({ liquidationRatio }) => (
              <Text sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio)}</Text>
            ),
          },
          {
            header: <Text />,
            cell: ({ ilk }) => (
              <Box sx={{ textAlign: 'right' }}>
                <AppLink href={`/vaults/open/${ilk}`} variant="secondary">
                  {t('open-vault')}
                </AppLink>
              </Box>
            ),
          },
        ]}
      />
    </Grid>
  )
}
