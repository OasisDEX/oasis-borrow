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
import { parseQueryString } from 'features/productHub/helpers'
import { useProductHubRouter } from 'features/productHub/hooks'
import type {
  ProductHubColumnKey,
  ProductHubFeaturedFilters,
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
  dataParser?: (table: ProductHubItem[]) => ProductHubItem[]
  featured?: ProductHubFeaturedFilters[]
  headerGradient?: [string, string, ...string[]]
  hiddenColumns?: ProductHubColumnKey[]
  hiddenHelp?: boolean
  hiddenProductTypeSelector?: boolean
  highlighted?: ProductHubFeaturedFilters[]
  initialFilters?: ProductHubFilters
  limitRows?: number
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  product: OmniProductType
  url?: string
}

export const ProductHubView: FC<ProductHubViewProps> = ({
  dataParser = (_table) => _table,
  featured,
  headerGradient = ['#007da3', '#e7a77f', '#e97047'],
  hiddenColumns,
  hiddenHelp,
  hiddenProductTypeSelector = false,
  highlighted,
  initialFilters = {},
  limitRows,
  onRowClick,
  perPage,
  product,
  url,
}) => {
  const { productHub: data } = usePreloadAppDataContext()
  const table = dataParser(data.table)

  const { connecting, wallet } = useWalletManagement()
  const searchParams = useSearchParams()

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
          <Box sx={{ position: 'relative', mb: [3, null, 5], textAlign: 'center', zIndex: '3' }}>
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
                featured={featured}
                hiddenColumns={hiddenColumns}
                hiddenHelp={hiddenHelp}
                highlighted={highlighted}
                limitRows={limitRows}
                networkId={wallet?.chainId}
                perPage={perPage}
                selectedFilters={selectedFilters}
                selectedProduct={selectedProduct}
                tableData={table}
                onChange={(_selectedFilters) => {
                  setSelectedFilters(_selectedFilters)
                }}
                onRowClick={onRowClick}
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
