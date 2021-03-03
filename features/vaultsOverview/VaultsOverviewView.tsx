import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { IlkWithBalance } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { AppLink } from 'components/Links'
import { Table, TableSortHeader } from 'components/Table'
import {
  formatAddress,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'i18n'
import React from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { IlksWithFilters } from '../ilks/ilksFilters'
import { TokenSymbol } from '../landing/LandingView'
import { VaultsWithFilters } from './vaultsFilters'
import { FeaturedIlk, VaultsOverview } from './vaultsOverview'
import { VaultSummary } from './vaultSummary'

function VaultsTable({ vaults }: { vaults: VaultsWithFilters }) {
  const { data, filters } = vaults
  const { t } = useTranslation()
  return (
    <Table
      data={data}
      primaryKey="id"
      rowDefinition={[
        {
          header: <Text variant="tableHead">{t('system.asset')}</Text>,
          cell: ({ token }) => <TokenSymbol token={token} />,
        },
        {
          header: (
            <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateral">
              {t('system.deposited')}
            </TableSortHeader>
          ),
          cell: ({ lockedCollateral }) => (
            <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(lockedCollateral)}</Text>
          ),
        },
        {
          header: (
            <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="freeCollateral">
              {t('system.available-to-withdraw')}
            </TableSortHeader>
          ),
          cell: ({ freeCollateral }) => (
            <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(freeCollateral)}</Text>
          ),
        },
        {
          header: (
            <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="debt">
              {t('system.dai')}
            </TableSortHeader>
          ),
          cell: ({ debt }) => <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(debt)}</Text>,
        },
        {
          header: (
            <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateralizationRatio">
              {t('system.coll-ratio')}
            </TableSortHeader>
          ),
          cell: ({ collateralizationRatio }) => (
            <Text sx={{ textAlign: 'right' }}>
              {collateralizationRatio ? formatPercent(collateralizationRatio.times(100)) : 0}
            </Text>
          ),
        },
        {
          header: <Text />,
          cell: ({ id }) => (
            <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
              <AppLink
                sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
                variant="secondary"
                as={`/${id}`}
                href={`/[vault]`}
              >
                {t('manage-vault')}
              </AppLink>
            </Box>
          ),
        },
      ]}
    />
  )
}

function AllIlks({
  ilks,
  isReadonly,
}: {
  ilks: IlksWithFilters
  isReadonly: boolean
  address: string
}) {
  const { data, filters } = ilks
  const { t } = useTranslation()

  return (
    <Table
      primaryKey="ilk"
      data={data}
      rowDefinition={[
        {
          header: <Text variant="tableHead">{t('system.asset')}</Text>,
          cell: ({ token }) => <TokenSymbol token={token} />,
        },
        {
          header: <Text variant="tableHead">{t('system.type')}</Text>,
          cell: ({ ilk }) => <Text>{ilk}</Text>,
        },
        {
          header: (
            <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="ilkDebtAvailable">
              {t('system.dai-available')}
            </TableSortHeader>
          ),
          cell: ({ ilkDebtAvailable }) => (
            <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(ilkDebtAvailable)}</Text>
          ),
        },
        {
          header: (
            <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="stabilityFee">
              {t('system.stability-fee')}
            </TableSortHeader>
          ),
          cell: ({ stabilityFee }) => (
            <Text sx={{ textAlign: 'right' }}>{formatPercent(stabilityFee.times(100))}</Text>
          ),
        },
        {
          header: (
            <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="liquidationRatio">
              {t('system.min-coll-ratio')}
            </TableSortHeader>
          ),
          cell: ({ liquidationRatio }) => (
            <Text sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio.times(100))}</Text>
          ),
        },
        ...(isReadonly
          ? []
          : [
              {
                header: (
                  <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="balance">
                    {t('system.in-my-wallet')}
                  </TableSortHeader>
                ),
                cell: (ilk: IlkWithBalance) => (
                  <Flex sx={{ alignItems: 'baseline', justifyContent: 'flex-end' }}>
                    <Text sx={{ textAlign: 'right' }}>
                      {ilk.balance ? formatCryptoBalance(ilk.balance) : 0}
                    </Text>
                    <Text variant="paragraph3" sx={{ color: 'muted', ml: 1 }}>
                      {`($${ilk.balancePriceInUsd ? formatFiatBalance(ilk.balancePriceInUsd) : 0})`}
                    </Text>
                  </Flex>
                ),
              },
            ]),
        {
          header: <Text />,
          cell: ({ ilk }) => (
            <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
              <AppLink
                sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
                variant="secondary"
                href={`/vaults/open/${ilk}`}
              >
                {t('open-vault')}
              </AppLink>
            </Box>
          ),
        },
      ]}
    />
  )
}

interface CallToActionProps {
  ilk: FeaturedIlk
}
function CallToAction({ ilk }: CallToActionProps) {
  const token = getToken(ilk.token)
  const { t } = useTranslation()

  return (
    <Grid
      columns="1fr 1fr"
      sx={{
        flex: 1,
        cursor: 'pointer',
        background: token.background,
        borderRadius: 'large',
        p: 4,
        color: 'white',
      }}
    >
      <Box sx={{ gridColumn: '1/3' }}>
        <Text variant="caption">{ilk.title}</Text>
      </Box>
      <Box sx={{ gridColumn: '1/3' }}>
        <Heading variant="header2" sx={{ color: 'white', mb: 4 }}>
          {ilk.ilk}
        </Heading>
      </Box>
      <Flex>
        <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
          {t('system.stability-fee')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
          {formatPercent(ilk.stabilityFee)}
        </Text>
      </Flex>
      <Flex>
        <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
          {t('system.min-coll-ratio')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
          {formatPercent(ilk.liquidationRatio)}
        </Text>
      </Flex>
    </Grid>
  )
}
function Summary({ summary }: { summary: VaultSummary }) {
  const { t } = useTranslation()
  return (
    <Card>
      <Grid columns="repeat(4, 1fr)">
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.number-of-vaults')}
          </Text>
          <Text variant="header2">{summary.numberOfVaults}</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.total-locked')}
          </Text>
          <Text variant="header2">${formatCryptoBalance(summary.totalCollateralPrice)}</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.total-debt')}
          </Text>
          <Text variant="header2">{formatCryptoBalance(summary.totalDaiDebt)} DAI</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.vaults-at-risk')}
          </Text>
          <Text variant="header2">{summary.vaultsAtRisk}</Text>
        </Box>
        <Graph assetRatio={summary.depositedAssetRatio} />
      </Grid>
    </Card>
  )
}

function Graph({ assetRatio }: { assetRatio: Dictionary<BigNumber> }) {
  const assets = Object.entries(assetRatio).sort(([, ratioA], [, ratioB]) =>
    ratioB.comparedTo(ratioA),
  )

  return (
    <Box sx={{ gridColumn: '1/5', my: 3 }}>
      <Flex sx={{ borderRadius: 'small', overflow: 'hidden', boxShadow: 'medium' }}>
        {assets.map(([token, ratio]) => (
          <Box
            key={token}
            sx={{
              flex: ratio.toString(),
              height: 2,
              background: getToken(token).color || 'lightGray',
            }}
          />
        ))}
      </Flex>
      <Flex>
        {assets.map(([token, ratio]) => (
          <Box key={token} sx={{ my: 2, flex: ratio.toString() }}>
            {ratio.gt(0.08) && (
              <Flex>
                <Box sx={{ mr: 1 }}>
                  <Icon
                    name={getToken(token).iconCircle}
                    size="26px"
                    sx={{ verticalAlign: 'sub', mr: 2 }}
                  />
                </Box>
                <Box>
                  <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
                    {getToken(token).name}
                  </Text>
                  <Text variant="paragraph3" sx={{ color: 'text.muted' }}>
                    {formatPercent(ratio.times(100), { precision: 2 })}
                  </Text>
                </Box>
              </Flex>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

export function FeaturedIlks({ ilks }: { ilks: FeaturedIlk[] }) {
  return (
    <Grid columns={['1fr', '1fr 1fr 1fr']} gap={4}>
      {ilks.map((ilk) => (
        <CallToAction key={ilk.title} ilk={ilk} />
      ))}
    </Grid>
  )
}

interface Props {
  vaultsOverView: VaultsOverview
  context: Context
  address: string
}
export function VaultsOverviewView({ vaultsOverView, context, address }: Props) {
  const { vaults, vaultSummary, featuredIlks, ilks } = vaultsOverView
  const { t } = useTranslation()

  const readonlyAccount = context?.status === 'connectedReadonly' && (address as string)
  const displaySummary = vaults && vaults.data.length > 0 && vaultSummary
  const displayFeaturedIlks = vaults?.data.length === 0 && featuredIlks
  const displayVaults = vaults && vaults.data.length > 0 && vaults

  return (
    <Grid sx={{ flex: 1 }}>
      {readonlyAccount && (
        <Card sx={{ width: 'max-content', p: 3, justifySelf: 'center', m: 3 }}>
          {t('readonly-alert-message')} {formatAddress(readonlyAccount)}
        </Card>
      )}
      <Heading variant="header2" sx={{ textAlign: 'center' }} as="h1">
        {t('vaults-overview.header')}
      </Heading>
      <Text variant="header3" sx={{ textAlign: 'center', justifySelf: 'center', mb: 4 }}>
        {context.status === 'connected'
          ? t('vaults-overview.message-connected', {
              address: formatAddress(address),
              count: vaults.data?.length || 0,
            })
          : t('vaults-overview.message-not-connected', { address: formatAddress(address) })}
      </Text>
      {displaySummary && <Summary summary={displaySummary} />}
      {displayFeaturedIlks && <FeaturedIlks ilks={displayFeaturedIlks} />}
      {displayVaults && (
        <>
          <Heading>
            {context.status === 'connectedReadonly'
              ? t('vaults-overview.vaults')
              : t('vaults-overview.your-vaults')}
          </Heading>
          <VaultsTable vaults={displayVaults} />
        </>
      )}
      {ilks && (
        <>
          <Heading>Vaults</Heading>
          <AllIlks
            ilks={ilks}
            isReadonly={context?.status === 'connectedReadonly'}
            address={address}
          />
        </>
      )}
    </Grid>
  )
}
