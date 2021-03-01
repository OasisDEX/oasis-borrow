import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { AppLink } from 'components/Links'
import { Table } from 'components/Table'
import { formatAddress, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'i18n'
import React from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { TokenSymbol } from '../landing/LandingView'
import { FeaturedIlk, IlkDataWithBalance, VaultsOverview } from './vaultsOverview'
import { VaultSummary } from './vaultSummary'

function VaultsTable({ vaults }: { vaults: Vault[] }) {
  const { t } = useTranslation()

  return (
    <Table
      data={vaults}
      primaryKey="id"
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
          header: <Text sx={{ textAlign: 'right' }}>{t('system.deposited')}</Text>,
          cell: ({ lockedCollateral }) => (
            <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(lockedCollateral)}</Text>
          ),
        },
        {
          header: <Text sx={{ textAlign: 'right' }}>{t('system.available-to-withdraw')}</Text>,
          cell: ({ freeCollateral }) => (
            <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(freeCollateral)}</Text>
          ),
        },
        {
          header: <Text sx={{ textAlign: 'right' }}>{t('system.dai')}</Text>,
          cell: ({ debt }) => <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(debt)}</Text>,
        },
        {
          header: <Text sx={{ textAlign: 'right' }}>{t('system.coll-ratio')}</Text>,
          cell: ({ collateralizationRatio }) => (
            <Text sx={{ textAlign: 'right' }}>
              {collateralizationRatio ? formatPercent(collateralizationRatio.times(100)) : 0}
            </Text>
          ),
        },
        {
          header: <Text />,
          cell: ({ id }) => (
            <Box sx={{ textAlign: 'right' }}>
              <AppLink variant="secondary" as={`/${id}`} href={`/[vault]`}>
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
  canOpenVault,
  ilkDataList,
  isReadonly,
}: {
  canOpenVault: boolean
  ilkDataList: IlkDataWithBalance[]
  isReadonly: boolean
  address: string
}) {
  const { t } = useTranslation()

  return (
    <Table
      primaryKey="ilk"
      data={ilkDataList}
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
            <Text sx={{ textAlign: 'right' }}>{formatPercent(stabilityFee.times(100))}</Text>
          ),
        },
        {
          header: <Text sx={{ textAlign: 'right' }}>{t('system.min-coll-ratio')}</Text>,
          cell: ({ liquidationRatio }) => (
            <Text sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio.times(100))}</Text>
          ),
        },
        ...(isReadonly
          ? []
          : [
            {
              header: <Text sx={{ textAlign: 'right' }}>{t('system.in-my-wallet')}</Text>,
              cell: (ilk: IlkDataWithBalance) => (
                <Flex sx={{ alignItems: 'baseline', justifyContent: 'flex-end' }}>
                  <Text sx={{ textAlign: 'right' }}>
                    {ilk.balance ? formatCryptoBalance(ilk.balance) : 0}
                  </Text>
                  <Text variant="paragraph3" sx={{ color: 'muted' }}>
                    {`($${ilk.balancePrice ? formatCryptoBalance(ilk.balancePrice) : 0})`}
                  </Text>
                </Flex>
              ),
            },
          ]),
        {
          header: <Text />,
          cell: ({ ilk }) => (
            <Box sx={{ textAlign: 'right' }}>
              <AppLink variant="secondary" disabled={!canOpenVault} href={`/vaults/open/${ilk}`}>
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
  const { vaults, vaultSummary, featuredIlks, ilkDataList, canOpenVault } = vaultsOverView
  const { t } = useTranslation()

  const readonlyAccount = context?.status === 'connectedReadonly' && (address as string)
  const displaySummary = vaults && vaults.length > 0 && vaultSummary
  const displayFeaturedIlks = vaults?.length === 0 && featuredIlks
  const displayVaults = vaults && vaults.length > 0 && vaults

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
            count: vaults?.length || 0,
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
      {ilkDataList && (
        <AllIlks
          canOpenVault={canOpenVault}
          ilkDataList={ilkDataList}
          isReadonly={context?.status === 'connectedReadonly'}
          address={address}
        />
      )}
    </Grid>
  )
}
