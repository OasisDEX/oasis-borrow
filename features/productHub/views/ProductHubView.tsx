import type { AssetsTableSeparator } from 'components/assetsTable/types'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import type { OmniProductType } from 'features/omni-kit/types'
import {
  ProductHubIntro,
  ProductHubLoadingState,
  ProductHubViewAll,
} from 'features/productHub/components/'
import {
  ProductHubContentController,
  ProductHubProductTypeController,
} from 'features/productHub/controls'
import { parseQueryString, shuffleFiltersOrder } from 'features/productHub/helpers'
import { useProductHubRouter } from 'features/productHub/hooks'
import { MIN_LIQUIDITY } from 'features/productHub/meta'
import type {
  ProductHubColumnKey,
  ProductHubFeaturedProducts,
  ProductHubFilters,
  ProductHubItem,
} from 'features/productHub/types'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useSearchParams } from 'next/navigation'
import type { FC } from 'react'
import React, { Fragment, useState } from 'react'
import { Box } from 'theme-ui'

interface ProductHubViewProps {
  customSortByDefault?: (tableData: ProductHubItem[]) => ProductHubItem[]
  dataParser?: (table: ProductHubItem[]) => ProductHubItem[]
  featured?: ProductHubFeaturedProducts
  headerGradient?: [string, string, ...string[]]
  hiddenCategories?: boolean
  hiddenColumns?: ProductHubColumnKey[]
  hiddenHelp?: boolean
  hiddenProductTypeSelector?: boolean
  hiddenTags?: boolean
  initialFilters?: ProductHubFilters
  limitRows?: number
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  product: OmniProductType
  separator?: AssetsTableSeparator
  url?: string
}

export const ProductHubView: FC<ProductHubViewProps> = ({
  customSortByDefault,
  dataParser = (_table) => _table,
  featured,
  headerGradient = ['#007da3', '#e7a77f', '#e97047'],
  hiddenCategories,
  hiddenColumns,
  hiddenHelp,
  hiddenProductTypeSelector = false,
  hiddenTags,
  initialFilters = {},
  limitRows,
  onRowClick,
  perPage,
  product,
  separator,
  url,
}) => {
  const { productHub: data } = usePreloadAppDataContext()
  const table = dataParser(data.table)

  const { connecting, wallet } = useWalletManagement()
  const searchParams = useSearchParams()

  const [shuffledFeatured] = useState<ProductHubFeaturedProducts>(shuffleFiltersOrder(featured))
  const [selectedProduct, setSelectedProduct] = useState<OmniProductType>(product)
  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>({
    ...initialFilters,
    ...parseQueryString({ searchParams }),
  })

  const { query } = useProductHubRouter({ selectedFilters, selectedProduct, url })

  return (
    <Fragment key={product}>
      <Box
        id="product-hub"
        sx={{
          position: 'relative',
          mt: [3, null, 4],
          scrollMarginTop: 4,
          zIndex: 3,
        }}
      >
        {!hiddenProductTypeSelector && (
          <Box sx={{ position: 'relative', mb: 5, textAlign: 'center', zIndex: '3' }}>
            <ProductHubProductTypeController
              gradient={headerGradient}
              onChange={(_selectedProduct) => {
                setSelectedProduct(_selectedProduct)
                setSelectedFilters((_selectedFilters) => {
                  delete _selectedFilters['category']
                  delete _selectedFilters['collateral-token']
                  delete _selectedFilters['debt-token']
                  delete _selectedFilters['deposit-token']
                  delete _selectedFilters['tags']
                  delete _selectedFilters['min-liquidity']

                  return _selectedFilters
                })
              }}
              defaultProduct={product}
            />
            <ProductHubIntro selectedProduct={selectedProduct} />
          </Box>
        )}
        <WithLoadingIndicator
          value={connecting ? [undefined] : [connecting]}
          customLoader={<ProductHubLoadingState />}
        >
          {() => (
            <>
              <ProductHubContentController
                customSortByDefault={customSortByDefault}
                featured={shuffledFeatured}
                hiddenColumns={hiddenColumns}
                hiddenCategories={hiddenCategories}
                hiddenHelp={hiddenHelp}
                hiddenTags={hiddenTags}
                limitRows={limitRows}
                networkId={wallet?.chainId}
                onChange={(_selectedFilters) => {
                  setSelectedFilters(() => {
                    if (_selectedFilters['min-liquidity']?.[0] === MIN_LIQUIDITY.toString())
                      delete _selectedFilters['min-liquidity']

                    return _selectedFilters
                  })
                }}
                onRowClick={onRowClick}
                perPage={perPage}
                selectedFilters={selectedFilters}
                selectedProduct={selectedProduct}
                separator={separator}
                tableData={table}
              />
              {limitRows && limitRows > 0 && (
                <ProductHubViewAll query={query} selectedProduct={selectedProduct} />
              )}
            </>
          )}
        </WithLoadingIndicator>
      </Box>
    </Fragment>
  )
}
