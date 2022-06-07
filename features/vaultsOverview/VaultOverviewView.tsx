import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { VaultOverviewOwnershipBanner } from 'features/banners/VaultsBannersView'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import {
  formatAddress,
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { ProductCardData } from 'helpers/productCards'
import { Trans, useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { Pages, trackingEvents } from '../../analytics/analytics'
import { CoinTag, getToken } from '../../blockchain/tokensMetadata'
import { Vault } from '../../blockchain/vaults'
import { PositionList } from '../../components/dumb/PositionList'
import { ColumnDef, Table, TableSortHeader } from '../../components/Table'
import { VaultDetailsAfterPill } from '../../components/vault/VaultDetails'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { useRedirect } from '../../helpers/useRedirect'
import { StopLossTriggerData } from '../automation/protection/common/StopLossTriggerDataExtractor'
import { AssetsAndPositionsOverview } from './containers/AssetsAndPositionsOverview'
import { Filters } from './Filters'
import { Summary } from './Summary'
import { VaultsFilterState, VaultsWithFilters } from './vaultsFilters'
import { VaultsOverview } from './vaultsOverview'
import { VaultSuggestions } from './VaultSuggestions'

interface Props {
  vaultsOverview: VaultsOverview
  context: Context
  address: string
  ensName: string | null | undefined
  productCardsData: ProductCardData[]
}

const vaultsColumns: ColumnDef<Vault & StopLossTriggerData, VaultsFilterState>[] = [
  {
    headerLabel: 'system.asset',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ ilk, token, isStopLossEnabled, debt }) => {
      const tokenInfo = getToken(token)
      const { t } = useTranslation()

      return (
        <Flex>
          <Icon name={tokenInfo.iconCircle} size="26px" sx={{ verticalAlign: 'sub', mr: 2 }} />
          <Box sx={{ whiteSpace: 'nowrap' }}>{ilk}</Box>
          {isStopLossEnabled && !debt.isZero() && (
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

function VaultsOverviewPerType({
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

function TotalAssets({ totalValueUsd }: { totalValueUsd: BigNumber }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ mb: 4 }}>
      <Text variant="header4" sx={{ mb: 1 }}>
        {t('vaults-overview.total-assets')}
      </Text>
      <Text variant="paragraph3" sx={{ color: 'lavender', display: ['none', 'block'] }}>
        <Trans
          i18nKey="vaults-overview.total-assets-subheader"
          components={[
            <AppLink
              href="https://kb.oasis.app/help/curated-token-list"
              target="_blank"
              sx={{ fontWeight: 'body' }}
            />,
          ]}
        />
      </Text>
      <Text variant="display" sx={{ fontWeight: 'body' }}>
        ${formatAmount(totalValueUsd, 'USD')}
      </Text>
    </Box>
  )
}

export function VaultsOverviewView({
  vaultsOverview,
  context,
  address,
  ensName,
  productCardsData,
}: Props) {
  const { t } = useTranslation()

  const earnEnabled = useFeatureToggle('EarnProduct')
  const { positionsOverviewSummary$ } = useAppContext()
  const [positionsOverviewSummary, err] = useObservable(positionsOverviewSummary$(address))
  const { positions, vaults, vaultSummary } = vaultsOverview
  const numberOfVaults = positions.length

  if (vaultSummary === undefined) {
    return null
  }

  const connectedAccount = context?.status === 'connected' ? context.account : undefined
  const headerTranslationKey = getHeaderTranslationKey(connectedAccount, address, numberOfVaults)

  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      {connectedAccount && address !== connectedAccount && (
        <VaultOverviewOwnershipBanner account={connectedAccount} controller={address} />
      )}
      <Flex sx={{ mt: 5, mb: 4, flexDirection: 'column' }}>
        {earnEnabled && (
          <WithErrorHandler error={err}>
            <WithLoadingIndicator value={positionsOverviewSummary}>
              {(positionsOverviewSummary) => (
                <>
                  <TotalAssets totalValueUsd={positionsOverviewSummary.totalValueUsd} />
                  {positionsOverviewSummary.assetsAndPositions.length > 0 && (
                    <AssetsAndPositionsOverview {...positionsOverviewSummary} />
                  )}
                </>
              )}
            </WithLoadingIndicator>
          </WithErrorHandler>
        )}
        <Heading variant="header2" sx={{ textAlign: 'center' }} as="h1">
          <Trans
            i18nKey={headerTranslationKey}
            values={{ address: formatAddress(address) }}
            components={[<br />]}
          />
        </Heading>
        {isOwnerViewing && numberOfVaults === 0 && (
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
        {context.status === 'connectedReadonly' && numberOfVaults === 0 && (
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
      {numberOfVaults !== 0 && (
        <>
          <Summary summary={vaultSummary} />
          {!earnEnabled && (
            <Grid gap={5}>
              <VaultsOverviewPerType vaults={vaults.borrow} heading="Borrow Vaults" />
              <VaultsOverviewPerType vaults={vaults.multiply} heading="Multiply Vaults" multiply />
            </Grid>
          )}
          {earnEnabled && (
            <Card variant="surface" sx={{ mb: 5, px: 3 }}>
              <PositionList positions={positions} />
            </Card>
          )}
        </>
      )}
      {isOwnerViewing && (
        <VaultSuggestions productCardsData={productCardsData} address={ensName || address} />
      )}
    </Grid>
  )
}
