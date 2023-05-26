import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { ProductHubLoadingState } from 'features/productHub/components'
import {
  ProductHubFiltersController,
  ProductHubNaturalLanguageSelectorController,
  ProductHubPromoCardsController,
  ProductHubTableController,
} from 'features/productHub/controls'
import { matchRowsByFilters, matchRowsByNL, parseRows } from 'features/productHub/helpers'
import { useProductHubData } from 'features/productHub/hooks/useProductHubData'
import { ALL_ASSETS, EMPTY_FILTERS, productHubLinksMap } from 'features/productHub/meta'
import { ProductHubFilters, ProductType } from 'features/productHub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { productHubData } from 'helpers/mocks/productHubData.mock'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React, { FC, useMemo, useState } from 'react'
import { Box, Text } from 'theme-ui'

interface ProductHubViewProps {
  product: ProductType
  token?: string
}

export const ProductHubView: FC<ProductHubViewProps> = ({ product, token }) => {
  const { t } = useTranslation()
  const { data } = useProductHubData({ protocol: LendingProtocol.Ajna })
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(product)
  const [selectedToken, setSelectedToken] = useState<string>(token || ALL_ASSETS)
  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>(EMPTY_FILTERS)

  const dataMatchedByNL = useMemo(
    () => matchRowsByNL(productHubData.table, selectedProduct, selectedToken),
    [selectedProduct, selectedToken],
  )
  const dataMatchedByFilters = useMemo(
    () => matchRowsByFilters(dataMatchedByNL, selectedFilters),
    [dataMatchedByNL, selectedFilters],
  )
  const parsedRows = useMemo(
    () => parseRows(dataMatchedByFilters, selectedProduct),
    [dataMatchedByFilters, selectedProduct],
  )

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
        {() => (
          <>
            <ProductHubPromoCardsController
              promoCardsData={productHubData.promoCards}
              selectedProduct={selectedProduct}
              selectedToken={selectedToken}
            />
            <AssetsTableContainer>
              <ProductHubFiltersController
                data={dataMatchedByNL}
                selectedFilters={selectedFilters}
                selectedProduct={selectedProduct}
                selectedToken={selectedToken}
                onChange={setSelectedFilters}
              />
              <ProductHubTableController rows={parsedRows} selectedToken={selectedToken} />
            </AssetsTableContainer>
          </>
        )}
      </WithLoadingIndicator>
    </AnimatedWrapper>
  )
}
