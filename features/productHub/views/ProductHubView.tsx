import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import {
  ProductHubNaturalLanguageSelectorController,
  ProductHubPromoCardsController,
} from 'features/productHub/controls'
import { ProductHubContentController } from 'features/productHub/controls/ProductHubContentController'
import {
  getInitialFilters,
  getInitialQueryString,
  getStrippedQueryString,
} from 'features/productHub/helpers'
import { useProductHubRouter } from 'features/productHub/hooks/useProductHubRouter'
import { ALL_ASSETS } from 'features/productHub/meta'
import type {
  ProductHubFilters,
  ProductHubProductType,
  ProductHubQueryString,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import type { PromoCardsCollection } from 'handlers/product-hub/types'
import type { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import { useSearchParams } from 'next/navigation'
import type { FC, ReactNode } from 'react'
import React, { Fragment, useMemo, useState } from 'react'
import { Box, Flex } from 'theme-ui'

interface ProductHubViewProps {
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  intro?: (selectedProduct: ProductHubProductType, selectedToken: string) => ReactNode
  headerGradient?: [string, string, ...string[]]
  product: ProductHubProductType
  promoCardsCollection: PromoCardsCollection
  token?: string
  url?: string
  limitRows?: number
}

export const ProductHubView: FC<ProductHubViewProps> = ({
  initialNetwork,
  initialProtocol,
  headerGradient = ['#007DA3', '#E7A77F', '#E97047'],
  product,
  promoCardsCollection,
  intro,
  token,
  url,
  limitRows,
}) => {
  const { t } = useTranslation()

  const { productHub: data } = usePreloadAppDataContext()
  const searchParams = useSearchParams()

  const initialQueryString = getInitialQueryString(searchParams)
  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(product)
  const [selectedToken, setSelectedToken] = useState<string>(token || ALL_ASSETS)
  const defaultFilters = useMemo(
    () =>
      getInitialFilters({
        initialQueryString,
        initialNetwork,
        initialProtocol,
        selectedProduct,
        token,
      }),
    [initialNetwork, initialProtocol, initialQueryString, selectedProduct, token],
  )
  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>(defaultFilters)
  const [queryString, setQueryString] = useState<ProductHubQueryString>(initialQueryString)

  useProductHubRouter({
    queryString,
    selectedProduct,
    selectedToken,
    url,
  })

  return (
    <Fragment key={product}>
      <Box
        id="product-hub"
        sx={{
          position: 'relative',
          my: [3, null, '48px'],
          scrollMarginTop: '48px',
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        <ProductHubNaturalLanguageSelectorController
          gradient={headerGradient}
          product={product}
          token={token}
          onChange={(_selectedProduct, _selectedToken) => {
            setSelectedProduct(_selectedProduct)
            setSelectedToken(_selectedToken)
            setSelectedFilters(
              getInitialFilters({
                initialQueryString,
                initialNetwork,
                initialProtocol,
                selectedProduct: _selectedProduct,
                token,
              }),
            )
            setQueryString(
              getStrippedQueryString({ selectedProduct: _selectedProduct, queryString }),
            )
          }}
        />
        {intro ? (
          intro(selectedProduct, selectedToken)
        ) : (
          <ProductHubIntro selectedProduct={selectedProduct} selectedToken={selectedToken} />
        )}
      </Box>

      <ProductHubPromoCardsController
        promoCardsData={PROMO_CARD_COLLECTIONS_PARSERS[promoCardsCollection](data.table)}
        selectedProduct={selectedProduct}
        selectedToken={selectedToken}
      />
      <ProductHubContentController
        initialNetwork={initialNetwork}
        initialProtocol={initialProtocol}
        queryString={queryString}
        selectedFilters={selectedFilters}
        selectedProduct={selectedProduct}
        selectedToken={selectedToken}
        tableData={data.table}
        onChange={(_selectedFilters, _queryString) => {
          setSelectedFilters(_selectedFilters)
          setQueryString(_queryString)
        }}
        limitRows={limitRows}
      />
      {limitRows && limitRows > 0 && (
        <Flex
          sx={{
            justifyContent: 'center',
            py: 4,
            borderBottom: '1px solid',
            borderBottomColor: 'neutral20',
          }}
        >
          <AppLink
            href={
              selectedToken === ALL_ASSETS
                ? `/${selectedProduct}`
                : `/${selectedProduct}/${selectedToken}`
            }
          >
            <WithArrow sx={{ color: 'interactive100', fontWeight: 'regular', fontSize: '16px' }}>
              {t('view-all')}
            </WithArrow>
          </AppLink>
        </Flex>
      )}
    </Fragment>
  )
}
