import { getToken } from 'blockchain/tokensMetadata'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AppLink } from 'components/Links'
import { PromoCard } from 'components/PromoCard'
import { WithArrow } from 'components/WithArrow'
import { NaturalLanguageSelectorController } from 'features/oasisCreate/controls/NaturalLanguageSelectorController'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import { OasisCreateProduct } from 'pages/oasis-create/[product]'
import React, { useState } from 'react'
import { Box, Grid, Text } from 'theme-ui'

interface OasisCreateViewProps {
  product: OasisCreateProduct
}

const LINKS_MAP = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

export function OasisCreateView({ product }: OasisCreateViewProps) {
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [selectedToken, setSelectedToken] = useState<string>()

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
          onChange={(product, token) => {
            setSelectedProduct(product)
            setSelectedToken(token)
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
          {t(`oasis-create.intro.${product}`)}{' '}
          <AppLink href={LINKS_MAP[product]}>
            <WithArrow
              variant="paragraph2"
              sx={{
                display: 'inline-block',
                fontSize: 3,
                color: 'interactive100',
                fontWeight: 'regular',
              }}
            >
              Oasis.app {t(`nav.${product}`)}
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
      <AssetsTableContainer padded>
        There should be Oasis Create table in there displaying all{' '}
        <strong>{selectedProduct}</strong> products filtered by <strong>{selectedToken}</strong>.
      </AssetsTableContainer>
    </AnimatedWrapper>
  )
}
