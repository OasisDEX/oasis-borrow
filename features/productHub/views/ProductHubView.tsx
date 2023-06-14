import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { ProductHubLoadingState } from 'features/productHub/components'
import {
  ProductHubNaturalLanguageSelectorController,
  ProductHubPromoCardsController,
} from 'features/productHub/controls'
import { ProductHubContentController } from 'features/productHub/controls/ProductHubContentController'
import { useProductHubData } from 'features/productHub/hooks/useProductHubData'
import { ALL_ASSETS, EMPTY_FILTERS, productHubLinksMap } from 'features/productHub/meta'
import { ProductHubFilters, ProductHubProductType } from 'features/productHub/types'
import ajnaHandler from 'handlers/product-hub/update-handlers/ajnaHandler'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React, { FC, useState } from 'react'
import { Box, Text } from 'theme-ui'

interface ProductHubViewProps {
  product: ProductHubProductType
  token?: string
}

export const ProductHubView: FC<ProductHubViewProps> = ({ product, token }) => {
  const { t } = useTranslation()
  const { data } = useProductHubData({
    protocols: [
      LendingProtocol.Ajna,
      LendingProtocol.AaveV2,
      LendingProtocol.AaveV3,
      LendingProtocol.Maker,
    ],
    promoCardsCollection: 'Home',
  })
  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(product)
  const [selectedToken, setSelectedToken] = useState<string>(token || ALL_ASSETS)
  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>(EMPTY_FILTERS)

  void ajnaHandler()

  return (
    <AnimatedWrapper sx={{ mb: 5 }}>
      <Box
        sx={{
          position: 'relative',
          my: [3, null, '48px'],
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        {}
        <ProductHubNaturalLanguageSelectorController
          product={product}
          token={token}
          url="/oasis-create/"
          onChange={(_selectedProduct, _selectedToken) => {
            setSelectedProduct(_selectedProduct)
            setSelectedToken(_selectedToken)
            setSelectedFilters(EMPTY_FILTERS)
          }}
        />
        <Text
          as="p"
          variant="paragraph2"
          sx={{
            mx: 'auto',
            mt: '24px',
          }}
        >
          {t(`product-hub.intro.${selectedProduct}`)}{' '}
          <AppLink href={productHubLinksMap[selectedProduct]}>
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
      <WithLoadingIndicator value={[data]} customLoader={<ProductHubLoadingState />}>
        {([_data]) => (
          <>
            <ProductHubPromoCardsController
              promoCardsData={_data.promoCards}
              selectedProduct={selectedProduct}
              selectedToken={selectedToken}
            />
            <ProductHubContentController
              selectedFilters={selectedFilters}
              selectedProduct={selectedProduct}
              selectedToken={selectedToken}
              tableData={_data.table}
              onChange={setSelectedFilters}
            />
          </>
        )}
      </WithLoadingIndicator>
    </AnimatedWrapper>
  )
}
