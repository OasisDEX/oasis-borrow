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
import type { ProductHubCustomFiltersOptions } from 'features/productHub/hooks/useProductHubFilters'
import { useProductHubRouter } from 'features/productHub/hooks/useProductHubRouter'
import { MIN_LIQUIDITY } from 'features/productHub/meta'
import type {
  ProductHubColumnKey,
  ProductHubDatabaseQuery,
  ProductHubFeaturedProducts,
  ProductHubFilters,
  ProductHubItem,
} from 'features/productHub/types'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useSearchParams } from 'next/navigation'
import React, { Fragment, useMemo, useState } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box } from 'theme-ui'

export interface ProductHubViewProps<ProductHubItem> {
  customSortByDefault?: (tableData: ProductHubItem[]) => ProductHubItem[]
  databaseQuery?: ProductHubDatabaseQuery
  dataParser?: (table: ProductHubItem[]) => ProductHubItem[]
  featured?: ProductHubFeaturedProducts
  headerGradient?: [string, string, ...string[]]
  hiddenBanners?: boolean
  hiddenCategories?: boolean
  hiddenColumns?: ProductHubColumnKey[]
  hiddenHelp?: boolean
  hiddenProductTypeSelector?: boolean
  hiddenTags?: boolean
  hiddenProtocolFilter?: boolean
  hiddenNetworkFilter?: boolean
  initialFilters?: ProductHubFilters
  limitRows?: number
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  product: OmniProductType
  separator?: AssetsTableSeparator
  url?: string
  wrapperSx?: ThemeUIStyleObject
  customFiltersOptions?: ProductHubCustomFiltersOptions
}

export function ProductHubView<
  Props extends ProductHubViewProps<ProductHubItem> = ProductHubViewProps<ProductHubItem>,
>({
  customSortByDefault,
  databaseQuery,
  dataParser = (_table) => _table,
  featured,
  headerGradient = ['#007da3', '#e7a77f', '#e97047'],
  hiddenBanners,
  hiddenCategories,
  hiddenColumns,
  hiddenHelp,
  hiddenProductTypeSelector = false,
  hiddenTags,
  hiddenProtocolFilter,
  hiddenNetworkFilter,
  initialFilters = {},
  limitRows,
  onRowClick,
  perPage,
  product,
  separator,
  url,
  wrapperSx,
  customFiltersOptions,
}: Props) {
  const { productHub: data } = usePreloadAppDataContext()
  const table = useMemo(() => dataParser(data.table), [])

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
          ...wrapperSx,
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
                databaseQuery={databaseQuery}
                customSortByDefault={customSortByDefault}
                featured={shuffledFeatured}
                hiddenBanners={hiddenBanners}
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
                hiddenNetworkFilter={hiddenNetworkFilter}
                hiddenProtocolFilter={hiddenProtocolFilter}
                customFiltersOptions={customFiltersOptions}
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
