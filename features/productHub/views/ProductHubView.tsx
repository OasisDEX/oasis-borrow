import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import { ProductHubLoadingState } from 'features/productHub/components/ProductHubLoadingState'
import { ProductHubViewAll } from 'features/productHub/components/ProductHubViewAll'
import {
  ProductHubProductTypeSelectorController,
  ProductHubPromoCardsController,
} from 'features/productHub/controls'
import { ProductHubContentController } from 'features/productHub/controls/ProductHubContentController'
import type {
  ProductHubColumnKey,
  ProductHubFilters,
  ProductHubItem,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import type { PromoCardsCollection } from 'handlers/product-hub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import type { LendingProtocol } from 'lendingProtocols'
import type { FC, ReactNode } from 'react'
import React, { Fragment, useState } from 'react'
import { Box } from 'theme-ui'

interface ProductHubViewProps {
  dataParser?: (table: ProductHubItem[]) => ProductHubItem[]
  headerGradient?: [string, string, ...string[]]
  hiddenColumns?: ProductHubColumnKey[]
  hiddenProductTypeSelector?: boolean
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  limitRows?: number
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  product: ProductHubProductType
  promoCardsCollection: PromoCardsCollection
  promoCardsHeading?: ReactNode
  promoCardsPosition?: 'top' | 'bottom' | 'none'
  url?: string
}

export const ProductHubView: FC<ProductHubViewProps> = ({
  dataParser = (_table) => _table,
  headerGradient = ['#007DA3', '#E7A77F', '#E97047'],
  hiddenColumns,
  hiddenProductTypeSelector = false,
  // initialNetwork,
  // initialProtocol,
  limitRows,
  onRowClick,
  perPage,
  product,
  promoCardsCollection,
  promoCardsHeading,
  promoCardsPosition = 'top',
  // url,
}) => {
  const { productHub: data } = usePreloadAppDataContext()
  const table = dataParser(data.table)

  const { connecting, wallet } = useWalletManagement()

  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(product)
  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>({})

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
          <Box
            sx={{ position: 'relative', mb: [3, null, '48px'], textAlign: 'center', zIndex: '3' }}
          >
            <ProductHubProductTypeSelectorController
              gradient={headerGradient}
              onChange={(_selectedProduct) => {
                setSelectedProduct(_selectedProduct)
                setSelectedFilters((_selectedFilters) => {
                  if (_selectedProduct === ProductHubProductType.Earn) {
                    delete _selectedFilters['collateral-token']
                    delete _selectedFilters['debt-token']
                  } else {
                    delete _selectedFilters['deposit-token']
                  }

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
              {promoCardsPosition === 'top' && (
                <ProductHubPromoCardsController
                  heading={promoCardsHeading}
                  promoCardsData={PROMO_CARD_COLLECTIONS_PARSERS[promoCardsCollection](table)}
                  selectedProduct={selectedProduct}
                />
              )}
              <ProductHubContentController
                hiddenColumns={hiddenColumns}
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
                <ProductHubViewAll query={{}} selectedProduct={selectedProduct} />
              )}
              {promoCardsPosition === 'bottom' && (
                <ProductHubPromoCardsController
                  heading={promoCardsHeading}
                  promoCardsData={PROMO_CARD_COLLECTIONS_PARSERS[promoCardsCollection](table)}
                  selectedProduct={selectedProduct}
                />
              )}
            </>
          )}
        </WithLoadingIndicator>
      </Box>
    </Fragment>
  )
}
