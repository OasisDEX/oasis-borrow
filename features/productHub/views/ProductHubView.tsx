import { getNetworkById, NetworkNames } from 'blockchain/networks'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import { ProductHubLoadingState } from 'features/productHub/components/ProductHubLoadingState'
import { ProductHubViewAll } from 'features/productHub/components/ProductHubViewAll'
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
  ProductHubColumnKey,
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
import type { FC, ReactNode } from 'react'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { Box } from 'theme-ui'

interface ProductHubViewProps {
  dataParser?: (table: ProductHubItem[]) => ProductHubItem[]
  headerGradient?: [string, string, ...string[]]
  hiddenColumns?: ProductHubColumnKey[]
  hiddenNLS?: boolean
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  intro?: (selectedProduct: ProductHubProductType, selectedToken: string) => ReactNode
  limitRows?: number
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  product: ProductHubProductType
  promoCardsCollection: PromoCardsCollection
  promoCardsHeading?: ReactNode
  promoCardsPosition?: 'top' | 'bottom' | 'none'
  token?: string
  url?: string
}

export const ProductHubView: FC<ProductHubViewProps> = ({
  dataParser = (_table) => _table,
  headerGradient = ['#007DA3', '#E7A77F', '#E97047'],
  hiddenColumns,
  hiddenNLS = false,
  initialNetwork,
  initialProtocol,
  intro,
  limitRows,
  onRowClick,
  perPage,
  product,
  promoCardsCollection,
  promoCardsHeading,
  promoCardsPosition = 'top',
  token,
  url,
}) => {
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

  const { query } = useProductHubRouter({
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
          mt: [3, null, '48px'],
          scrollMarginTop: '48px',
          zIndex: 3,
        }}
      >
        {!hiddenNLS && (
          <Box sx={{ mb: [3, null, '48px'], textAlign: 'center' }}>
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
        )}
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
                hiddenColumns={hiddenColumns}
                initialNetwork={resolvedInitialNetwork}
                initialProtocol={initialProtocol}
                limitRows={limitRows}
                networkId={wallet?.chainId}
                perPage={perPage}
                queryString={queryString}
                selectedFilters={selectedFilters}
                selectedProduct={selectedProduct}
                selectedToken={selectedToken}
                tableData={table}
                onChange={(_selectedFilters, _queryString) => {
                  setSelectedFilters(_selectedFilters)
                  setQueryString(_queryString)
                }}
                onRowClick={onRowClick}
              />
              {limitRows && limitRows > 0 && (
                <ProductHubViewAll
                  query={query}
                  selectedProduct={selectedProduct}
                  selectedToken={selectedToken}
                />
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
      </Box>
    </Fragment>
  )
}
