import { getToken } from 'blockchain/tokensMetadata'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import { AppLink } from 'components/Links'
import { PromoCard } from 'components/PromoCard'
import { WithArrow } from 'components/WithArrow'
import {
  ALL_ASSETS,
  NaturalLanguageSelectorController,
} from 'features/oasisCreate/controls/NaturalLanguageSelectorController'
import { oasisCreateData } from 'features/oasisCreate/data'
import { filterRows } from 'features/oasisCreate/helpers/filterRows'
import { ProductType } from 'features/oasisCreate/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useState } from 'react'
import { Box, Grid, Text } from 'theme-ui'

interface OasisCreateViewProps {
  product: ProductType
}

const LINKS_MAP = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

export function OasisCreateView({ product }: OasisCreateViewProps) {
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(product)
  const [selectedToken, setSelectedToken] = useState<string>()

  const rows = useMemo(
    () =>
      filterRows(oasisCreateData, selectedProduct, {
        // protocol: LendingProtocol.Ajna,
        ...(selectedToken !== ALL_ASSETS && {
          groupToken: selectedToken,
        }),
      }),
    [selectedProduct, selectedToken],
  )

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
          <AppLink href={LINKS_MAP[selectedProduct]}>
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
      <AssetsTableContainer tableOnly>
        <AssetsFiltersContainer gridTemplateColumns="205px auto 205px 205px">
          <Box>asd</Box>
          <Box />
          <Box>asd</Box>
          <Box>asd</Box>
        </AssetsFiltersContainer>
        {rows.length > 0 ? (
          <AssetsResponsiveTable
            rows={rows}
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
