import { networksByName } from 'blockchain/networksConfig'
import { getToken } from 'blockchain/tokensMetadata'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import { GenericMultiselect } from 'components/GenericMultiselect'
import { AppLink } from 'components/Links'
import { PromoCard } from 'components/PromoCard'
import { WithArrow } from 'components/WithArrow'
import { NaturalLanguageSelectorController } from 'features/oasisCreate/controls/NaturalLanguageSelectorController'
import { oasisCreateData } from 'features/oasisCreate/data'
import { filterRows } from 'features/oasisCreate/helpers/filterRows'
import { parseRows } from 'features/oasisCreate/helpers/parseRows'
import { ALL_ASSETS, oasisCreateLinksMap } from 'features/oasisCreate/meta'
import { OasisCreateFilters, ProductType } from 'features/oasisCreate/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { uniq } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useState } from 'react'
import { theme } from 'theme'
import { Box, Grid, Text } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface OasisCreateViewProps {
  product: ProductType
}

export function OasisCreateView({ product }: OasisCreateViewProps) {
  const { t } = useTranslation()
  const isMobileScreen = useMediaQuery(`(max-width: ${theme.breakpoints[1]})`)
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(product)
  const [selectedToken, setSelectedToken] = useState<string>(ALL_ASSETS)
  const [selectedFilters, setSelectedFilters] = useState<OasisCreateFilters>({})

  const rowsFilteredByToken = useMemo(
    () =>
      filterRows(oasisCreateData, selectedProduct, {
        ...(selectedToken !== ALL_ASSETS && { groupToken: selectedToken }),
      }),
    [selectedProduct, selectedToken],
  )
  const rowsFilteredByAll = useMemo(
    () => filterRows(rowsFilteredByToken, selectedProduct, selectedFilters),
    [rowsFilteredByToken, selectedProduct, selectedFilters],
  )
  const parsedRows = useMemo(
    () => parseRows(rowsFilteredByAll, selectedProduct),
    [rowsFilteredByAll, selectedProduct],
  )
  const debtTokens = useMemo(
    () =>
      uniq(rowsFilteredByToken.map((item) => item.secondaryToken)).map((item) => ({
        label: item,
        value: item,
        icon: getToken(item).iconCircle,
      })),
    [rowsFilteredByToken],
  )
  const networks = [
    {
      label: networksByName[BaseNetworkNames.Ethereum].label,
      value: networksByName[BaseNetworkNames.Ethereum].name,
      image: networksByName[BaseNetworkNames.Ethereum].icon,
    },
    {
      label: networksByName[BaseNetworkNames.Arbitrum].label,
      value: networksByName[BaseNetworkNames.Arbitrum].name,
      image: networksByName[BaseNetworkNames.Arbitrum].icon,
    },
    {
      label: networksByName[BaseNetworkNames.Optimism].label,
      value: networksByName[BaseNetworkNames.Optimism].name,
      image: networksByName[BaseNetworkNames.Optimism].icon,
    },
  ]
  const protocols = [
    {
      label: lendingProtocolsByName[LendingProtocol.Maker].label,
      value: lendingProtocolsByName[LendingProtocol.Maker].name,
      image: lendingProtocolsByName[LendingProtocol.Maker].icon,
    },
    {
      label: lendingProtocolsByName[LendingProtocol.AaveV2].label,
      value: lendingProtocolsByName[LendingProtocol.AaveV2].name,
      image: lendingProtocolsByName[LendingProtocol.AaveV2].icon,
    },
    {
      label: lendingProtocolsByName[LendingProtocol.AaveV3].label,
      value: lendingProtocolsByName[LendingProtocol.AaveV3].name,
      image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
    },
    {
      label: lendingProtocolsByName[LendingProtocol.Ajna].label,
      value: lendingProtocolsByName[LendingProtocol.Ajna].name,
      image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    },
  ]

  return (
    <AnimatedWrapper>
      <Box
        sx={{
          my: [3, null, '48px'],
          textAlign: 'center',
        }}
      >
        <NaturalLanguageSelectorController
          product={product}
          url="/oasis-create/"
          onChange={(_selectedProduct, _selectedToken) => {
            setSelectedProduct(_selectedProduct)
            setSelectedToken(_selectedToken)
            setSelectedFilters({})
          }}
        />
        <Text
          as="p"
          variant="paragraph2"
          sx={{
            mx: 'auto',
            mt: '24px',
            color: 'neutral80',
          }}
        >
          {t(`oasis-create.intro.${selectedProduct}`)}{' '}
          <AppLink href={oasisCreateLinksMap[selectedProduct]}>
            <WithArrow
              variant="paragraph2"
              sx={{
                display: 'inline-block',
                fontSize: 3,
                color: 'interactive100',
                fontWeight: 'regular',
              }}
            >
              Oasis.app {t(`nav.${selectedProduct}`)}
            </WithArrow>
          </AppLink>
        </Text>
      </Box>
      <Grid columns={[1, null, 2, 3]} gap={3} sx={{ mb: 4 }}>
        <PromoCard
          icon={getToken('ETH').iconCircle}
          title="Borrow cheap USDC with ETH"
          protocol={{ network: BaseNetworkNames.Ethereum, protocol: LendingProtocol.Maker }}
          pills={[{ label: 'Constant Multiple' }, { label: 'Stop-Loss Enabled' }]}
          data={[{ label: 'Net Annual Borrow Cost', value: '11.9%', variant: 'negative' }]}
        />
        <PromoCard
          icon={getToken('USDC').iconCircle}
          title="2.5x ETH/USDC Multiple"
          protocol={{ network: BaseNetworkNames.Ethereum, protocol: LendingProtocol.Ajna }}
          pills={[{ label: 'Up to 9.99x' }, { label: 'Liquidation risk', variant: 'negative' }]}
          data={[{ label: '90 Day Net APY', value: '12.43%' }]}
        />
        <PromoCard
          icon={getToken('USDC').iconCircle}
          title="2.5x ETH/USDC Multiple"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel neque quis nisl."
          link={{ href: EXTERNAL_LINKS.KB.HELP, label: t('learn-more') }}
        />
      </Grid>
      <AssetsTableContainer>
        <AssetsFiltersContainer
          key={`${selectedProduct}-${selectedToken}`}
          gridTemplateColumns={['100%', null, '1fr 1fr 1fr', '280px auto 280px 280px']}
        >
          {selectedProduct !== ProductType.Earn ? (
            <GenericMultiselect
              label={t('oasis-create.filters.debt-tokens')}
              icon="allAssets"
              options={debtTokens}
              onChange={(value) => {
                setSelectedFilters({
                  ...selectedFilters,
                  secondaryToken: value,
                })
              }}
            />
          ) : (
            <>{!isMobileScreen && <Box />}</>
          )}
          {!isSmallerScreen && <Box />}
          <GenericMultiselect
            label={t('oasis-create.filters.networks')}
            icon="allNetworks"
            options={networks}
            onChange={(value) => {
              setSelectedFilters({
                ...selectedFilters,
                network: value,
              })
            }}
          />
          <GenericMultiselect
            label={t('oasis-create.filters.protocols')}
            icon="allProtocols"
            options={protocols}
            onChange={(value) => {
              setSelectedFilters({
                ...selectedFilters,
                protocol: value,
              })
            }}
          />
        </AssetsFiltersContainer>
        {parsedRows.length > 0 ? (
          <AssetsResponsiveTable
            rows={parsedRows}
            headerTranslationProps={{
              ...(selectedToken && { token: selectedToken === ALL_ASSETS ? 'ETH' : selectedToken }),
            }}
          />
        ) : (
          <AssetsTableNoResults
            header="There are no items matching your filters"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis lorem in feugiat mattis."
          />
        )}
      </AssetsTableContainer>
    </AnimatedWrapper>
  )
}
