import { Icon } from '@makerdao/dai-ui-icons'
import { Pages, trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { AppLink } from 'components/Links'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import { VaultOverviewOwnershipBanner } from 'features/banners/VaultsBannersView'
import {
  formatAddress,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { useRedirect } from 'helpers/useRedirect'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { VaultDetailsAfterPill } from '../../components/vault/VaultDetails'
import { StopLossTriggerData } from '../automation/common/StopLossTriggerDataExtractor'
import { Filters } from './Filters'
import { VaultsFilterState, VaultsWithFilters } from './vaultsFilters'
import { VaultsOverview } from './vaultsOverview'
import { VaultSummary } from './vaultSummary'

const vaultsColumns: ColumnDef<Vault & StopLossTriggerData, VaultsFilterState>[] = [
  {
    headerLabel: 'system.asset',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ ilk, token, isStopLossEnabled }) => {
      const tokenInfo = getToken(token)
      const { t } = useTranslation()

      return (
        <Flex>
          <Icon name={tokenInfo.iconCircle} size="26px" sx={{ verticalAlign: 'sub', mr: 2 }} />
          <Box sx={{ whiteSpace: 'nowrap' }}>{ilk}</Box>
          {isStopLossEnabled && (
            <Box ml={2}>
              <VaultDetailsAfterPill
                afterPillColors={{ color: 'onSuccess', bg: 'success' }}
                sx={{ mt: 0 }}
              >
                {t('protection.stop-loss-on')}
              </VaultDetailsAfterPill>
            </Box>
          )}
        </Flex>
      )
    },
  },
  {
    headerLabel: 'system.vault-id',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="id">
        {label}
      </TableSortHeader>
    ),
    cell: ({ id }) => <Text sx={{ textAlign: 'right' }}>#{id.toString()}</Text>,
  },
  {
    headerLabel: 'system.liquidation-price',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="liquidationPrice">
        {label}
      </TableSortHeader>
    ),
    cell: ({ liquidationPrice }) => (
      <Text sx={{ textAlign: 'right' }}>${formatFiatBalance(liquidationPrice)}</Text>
    ),
  },
  {
    headerLabel: 'system.coll-ratio',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateralizationRatio">
        {label}
      </TableSortHeader>
    ),
    cell: (vault) => {
      return (
        <Text sx={{ textAlign: 'right', color: vault.atRiskLevelDanger ? 'onError' : 'onSuccess' }}>
          {formatPercent(vault.collateralizationRatio.times(100))}
        </Text>
      )
    },
  },
  {
    headerLabel: 'system.coll-locked',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateral">
        {label}
      </TableSortHeader>
    ),
    cell: ({ lockedCollateral, token }) => (
      <Text sx={{ textAlign: 'right' }}>
        {formatCryptoBalance(lockedCollateral)} {token}
      </Text>
    ),
  },
  {
    headerLabel: 'system.dai-debt',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="debt">
        {label}
      </TableSortHeader>
    ),
    cell: ({ debt }) => <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(debt)} DAI</Text>,
  },
  {
    headerLabel: '',
    header: () => <Text />,
    cell: ({ id }) => {
      const { t } = useTranslation()
      return (
        <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
          <AppLink
            sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
            variant="secondary"
            as={`/${id}`}
            href={`/[vault]`}
          >
            {t('manage-vault.action')}
          </AppLink>
        </Box>
      )
    },
  },
]
function VaultsTable({ vaults }: { vaults: VaultsWithFilters }) {
  const { data, filters } = vaults
  const { t } = useTranslation()
  const { push } = useRedirect()

  return (
    <Table
      data={data}
      primaryKey="address"
      state={filters}
      columns={vaultsColumns}
      noResults={<Box>{t('no-results')}</Box>}
      deriveRowProps={(row) => {
        return {
          onClick: () => {
            trackingEvents.overviewManage(row.id.toString(), row.ilk)
            push(`/${row.id}`)
          },
        }
      }}
    />
  )
}

export function Summary({ summary }: { summary: VaultSummary }) {
  const { t } = useTranslation()
  return (
    <Card variant="surface" sx={{ mb: 5, px: 4 }}>
      <Grid sx={{ pt: 3 }} columns={['1fr', 'repeat(4, 1fr)', 'repeat(4, 1fr)']}>
        <Box sx={{ gridColumn: ['initial', 'span 2', 'initial'] }}>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.number-of-vaults')}
          </Text>
          <Text variant="header2" sx={{ mt: 2 }}>
            {summary.numberOfVaults}
          </Text>
        </Box>
        <Box sx={{ gridColumn: ['initial', 'span 2', 'initial'] }}>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.total-locked')}
          </Text>
          <Text variant="header2" sx={{ mt: 2 }}>
            ${formatCryptoBalance(summary.totalCollateralPrice)}
          </Text>
        </Box>
        <Box
          sx={{ gridRow: ['initial', '2/3', 'auto'], gridColumn: ['initial', 'span 2', 'initial'] }}
        >
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.total-debt')}
          </Text>
          <Text variant="header2" sx={{ mt: 2 }}>
            {formatCryptoBalance(summary.totalDaiDebt)}
            <Text sx={{ fontSize: '20px', display: 'inline', ml: 2 }}>DAI</Text>
          </Text>
        </Box>
        <Box sx={{ gridRow: ['initial', '2/3', 'auto'] }}>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.vaults-at-risk')}
          </Text>
          <Text variant="header2" sx={{ mt: 2 }}>
            {summary.vaultsAtRisk}
          </Text>
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

  const totalRatio = assets.reduce(
    (acc, [_, ratio]) => (ratio.isNaN() ? acc : acc.plus(ratio)),
    zero,
  )

  return (
    <Box sx={{ gridColumn: ['1/2', '1/5', '1/5'], my: 3 }}>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 'small',
          display: ['none', 'flex', 'flex'],
        }}
      >
        {totalRatio.gt(zero) &&
          assets.map(([token, ratio]) => (
            <Box
              key={token}
              sx={{
                position: 'relative',
                flex: ratio.toString(),
                height: 4,
                '&:before': {
                  boxShadow: 'medium',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  content: `''`,
                  height: 2,
                  background: getToken(token).color || 'lightGray',
                },
                '&:first-of-type:before': {
                  borderTopLeftRadius: 'small',
                  borderBottomLeftRadius: 'small',
                },
                '&:last-of-type:before': {
                  borderTopRightRadius: 'small',
                  borderBottomRightRadius: 'small',
                },
                ...(ratio.lt(0.08)
                  ? {
                      '&:hover:after': {
                        opacity: 1,
                        transform: 'translate(-50%, -40px)',
                      },
                      '&:after': {
                        transition: 'ease-in-out 0.2s',
                        opacity: 0,
                        whiteSpace: 'nowrap',
                        content: `'${token}: ${formatPercent(ratio.times(100), { precision: 2 })}'`,
                        position: 'absolute',
                        left: '50%',
                        background: 'white',
                        padding: 2,
                        borderRadius: 'small',
                        transform: 'translate(-50%, 0)',
                        boxShadow: 'surface',
                        fontFamily: 'body',
                        fontWeight: 'body',
                        lineHeight: 'body',
                        fontSize: 1,
                        color: 'white',
                        bg: 'primary',
                      },
                    }
                  : {}),
              }}
            />
          ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: ['column', 'row', 'row'] }}>
        <Box
          as="hr"
          sx={{
            display: ['block', 'none', 'none'],
            borderColor: 'border',
            borderWidth: '1px',
            borderTop: 'none',
            mb: 3,
          }}
        />
        {assets.map(([token, ratio]) => (
          <Box key={token} sx={{ mb: 3, flex: ratio.toString() }}>
            <Box
              sx={{
                position: 'relative',
                top: '-14px',
                alignItems: 'center',
                display: ['flex', ...(ratio.gt(0.08) ? ['flex', 'flex'] : ['none', 'none'])],
              }}
            >
              <Box sx={{ mr: 1 }}>
                <Icon
                  name={getToken(token).iconCircle}
                  size="32px"
                  sx={{ verticalAlign: 'sub', mr: 2 }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  flexDirection: ['row', 'column', 'column'],
                }}
              >
                <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
                  {token}
                </Text>
                <Text variant="paragraph3" sx={{ color: 'text.muted', ml: [2, 0, 0] }}>
                  {formatPercent(ratio.isNaN() ? zero : ratio.times(100), { precision: 2 })}
                </Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

interface Props {
  vaultsOverview: VaultsOverview
  context: Context
  address: string
}

function getHeaderTranslationKey(
  connectedAccount: string | undefined,
  address: string,
  numberOfVaults: number,
) {
  const HEADERS_PATH = 'vaults-overview.headers'
  if (connectedAccount === undefined) {
    return numberOfVaults === 0
      ? `${HEADERS_PATH}.notConnected-noVaults`
      : `${HEADERS_PATH}.notConnected-withVaults`
  }

  if (address === connectedAccount) {
    return numberOfVaults === 0
      ? `${HEADERS_PATH}.connected-owner-noVaults`
      : `${HEADERS_PATH}.connected-owner-withVaults`
  }

  return numberOfVaults === 0
    ? `${HEADERS_PATH}.connected-viewer-noVaults`
    : `${HEADERS_PATH}.connected-viewer-withVaults`
}

function VaultsOverwiewPerType({
  vaults,
  heading,
  multiply,
}: {
  vaults: VaultsWithFilters
  heading: string
  multiply?: boolean
}) {
  const { t } = useTranslation()

  const onVaultSearch = useCallback(
    (search: string) => {
      vaults.filters.change({ kind: 'search', search })
    },
    [vaults.filters],
  )

  const onVaultsTagChange = useCallback(
    (tagFilter: CoinTag | undefined) => {
      vaults.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [vaults.filters],
  )

  return (
    <Grid gap={3}>
      <Heading mb={3} sx={{ fontWeight: 'bold', fontSize: 7 }}>
        {heading}
      </Heading>
      <Filters
        onSearch={onVaultSearch}
        search={vaults.filters.search}
        onTagChange={onVaultsTagChange}
        tagFilter={vaults.filters.tagFilter}
        defaultTag="your-vaults"
        page={Pages.VaultsOverview}
        searchPlaceholder={t('search-token')}
        multiply={multiply}
      />
      <VaultsTable vaults={vaults} />
    </Grid>
  )
}

export function VaultsOverviewView({ vaultsOverview, context, address }: Props) {
  const { vaults, vaultSummary } = vaultsOverview
  const { t } = useTranslation()

  if (vaultSummary === undefined) {
    return null
  }

  const connectedAccount = context?.status === 'connected' ? context.account : undefined

  const headerTranslationKey = getHeaderTranslationKey(
    connectedAccount,
    address,
    vaultSummary.numberOfVaults,
  )

  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      {connectedAccount && address !== connectedAccount && (
        <VaultOverviewOwnershipBanner account={connectedAccount} controller={address} />
      )}
      <Flex sx={{ mt: 5, mb: 4, flexDirection: 'column' }}>
        <Heading variant="header2" sx={{ textAlign: 'center' }} as="h1">
          <Trans
            i18nKey={headerTranslationKey}
            values={{ address: formatAddress(address) }}
            components={[<br />]}
          />
        </Heading>
        {isOwnerViewing && vaultSummary.numberOfVaults === 0 && (
          <>
            <Text variant="paragraph1" sx={{ mb: 3, color: 'lavender', textAlign: 'center' }}>
              <Trans i18nKey="vaults-overview.subheader-no-vaults" components={[<br />]} />
            </Text>
            <AppLink
              href="/"
              variant="primary"
              sx={{
                display: 'flex',
                margin: '0 auto',
                px: '40px',
                py: 2,
                my: 4,
                alignItems: 'center',
                '&:hover svg': {
                  transform: 'translateX(10px)',
                },
              }}
              hash="product-cards-wrapper"
            >
              {t('open-vault.title')}
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
          </>
        )}
        {context.status === 'connectedReadonly' && vaultSummary.numberOfVaults === 0 && (
          <>
            <AppLink
              href="/connect"
              variant="primary"
              sx={{
                display: 'flex',
                margin: '0 auto',
                px: '40px',
                py: 2,
                my: 4,
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
          </>
        )}
      </Flex>
      {vaultSummary.numberOfVaults !== 0 && (
        <>
          <Summary summary={vaultSummary} />
          <Grid gap={5}>
            <VaultsOverwiewPerType vaults={vaults.borrow} heading="Borrow Vaults" />
            <VaultsOverwiewPerType vaults={vaults.multiply} heading="Multiply Vaults" multiply />
          </Grid>
        </>
      )}
    </Grid>
  )
}
