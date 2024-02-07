import { getNetworkById, NetworkNames } from 'blockchain/networks'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import { ProductHubLoadingState } from 'features/productHub/components/ProductHubLoadingState'
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
  ProductHubItem,
  ProductHubProductType,
  ProductHubQueryString,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import type { PromoCardsCollection } from 'handlers/product-hub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import type { LendingProtocol } from 'lendingProtocols'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import type { FC, ReactNode } from 'react'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { Box, Flex } from 'theme-ui'

interface ProductHubViewProps {
  dataParser?: (table: ProductHubItem[]) => ProductHubItem[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  intro?: (selectedProduct: ProductHubProductType, selectedToken: string) => ReactNode
  headerGradient?: [string, string, ...string[]]
  product: ProductHubProductType
  promoCardsHeading?: ReactNode
  promoCardsPosition?: 'top' | 'bottom' | 'none'
  promoCardsCollection: PromoCardsCollection
  token?: string
  url?: string
  limitRows?: number
}

export const ProductHubView: FC<ProductHubViewProps> = ({
  dataParser = (_table) => _table,
  initialNetwork,
  initialProtocol,
  promoCardsHeading,
  headerGradient = ['#007DA3', '#E7A77F', '#E97047'],
  product,
  promoCardsCollection,
  promoCardsPosition = 'top',
  intro,
  token,
  url,
  limitRows,
}) => {
  const { t } = useTranslation()

  const { productHub: data } = usePreloadAppDataContext()
  const table = dataParser(data.table)
  const searchParams = useSearchParams()

  const { connecting, wallet } = useWalletManagement()

  const resolvedInitialNetwork: ProductHubSupportedNetworks[] = useMemo(() => {
    if (initialNetwork) return initialNetwork
    else if (wallet?.chainId)
      return [getNetworkById(wallet.chainId).name as ProductHubSupportedNetworks]
    else return [NetworkNames.ethereumMainnet as ProductHubSupportedNetworks]
  }, [initialNetwork, wallet?.chainId])

  const initialQueryString = getInitialQueryString(searchParams)
  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(product)
  const [selectedToken, setSelectedToken] = useState<string>(token || ALL_ASSETS)
  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>(
    getInitialFilters({
      initialQueryString,
      initialNetwork: resolvedInitialNetwork,
      initialProtocol,
      selectedProduct,
      token,
    }),
  )
  const [queryString, setQueryString] = useState<ProductHubQueryString>(initialQueryString)

  useEffect(() => {
    if (!queryString.network) {
      setSelectedFilters({
        or: selectedFilters.or,
        and: {
          ...selectedFilters.and,
          network: resolvedInitialNetwork,
        },
      })
    }
  }, [resolvedInitialNetwork])

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
                initialNetwork: resolvedInitialNetwork,
                initialProtocol,
                selectedProduct: _selectedProduct,
                token,
              }),
            )
            setQueryString(getStrippedQueryString({ queryString }))
          }}
        />
        {intro ? (
          intro(selectedProduct, selectedToken)
        ) : (
          <ProductHubIntro selectedProduct={selectedProduct} selectedToken={selectedToken} />
        )}
      </Box>
      <WithLoadingIndicator
        value={connecting ? [undefined] : [connecting]}
        customLoader={<ProductHubLoadingState />}
      >
        {() => (
          <>
            {promoCardsPosition === 'top' && (
              <ProductHubPromoCardsController
                heading={promoCardsHeading}
                promoCardsData={PROMO_CARD_COLLECTIONS_PARSERS[promoCardsCollection](table)}
                selectedProduct={selectedProduct}
                selectedToken={selectedToken}
              />
            )}
            <ProductHubContentController
              initialNetwork={resolvedInitialNetwork}
              initialProtocol={initialProtocol}
              queryString={queryString}
              selectedFilters={selectedFilters}
              selectedProduct={selectedProduct}
              selectedToken={selectedToken}
              tableData={table}
              onChange={(_selectedFilters, _queryString) => {
                setSelectedFilters(_selectedFilters)
                setQueryString(_queryString)
              }}
              chainId={wallet?.chainId}
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
                  <WithArrow
                    sx={{ color: 'interactive100', fontWeight: 'regular', fontSize: '16px' }}
                  >
                    {t('view-all')}
                  </WithArrow>
                </AppLink>
              </Flex>
            )}
            {promoCardsPosition === 'bottom' && (
              <ProductHubPromoCardsController
                heading={promoCardsHeading}
                promoCardsData={PROMO_CARD_COLLECTIONS_PARSERS[promoCardsCollection](table)}
                selectedProduct={selectedProduct}
                selectedToken={selectedToken}
              />
            )}
          </>
        )}
      </WithLoadingIndicator>
    </Fragment>
  )
}
