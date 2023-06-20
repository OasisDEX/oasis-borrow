import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { ProductHubFiltersController } from 'features/productHub/controls/ProductHubFiltersController'
import { ProductHubTableController } from 'features/productHub/controls/ProductHubTableController'
import { matchRowsByFilters, matchRowsByNL, parseRows } from 'features/productHub/helpers'
import {
  ProductHubFilters,
  ProductHubItem,
  ProductHubProductType,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import React, { FC, useMemo } from 'react'

interface ProductHubContentControllerProps {
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
  selectedToken: string
  tableData: ProductHubItem[]
  onChange: (selectedFilters: ProductHubFilters) => void
  limitRows?: number
}

export const ProductHubContentController: FC<ProductHubContentControllerProps> = ({
  initialNetwork = [],
  initialProtocol = [],
  selectedFilters,
  selectedProduct,
  selectedToken,
  tableData,
  onChange,
  limitRows,
}) => {
  const dataMatchedByNL = useMemo(
    () => matchRowsByNL(tableData, selectedProduct, selectedToken),
    [selectedProduct, selectedToken, tableData],
  )
  const dataMatchedByFilters = useMemo(
    () => matchRowsByFilters(dataMatchedByNL, selectedFilters),
    [dataMatchedByNL, selectedFilters],
  )
  const rows = useMemo(
    () => parseRows(dataMatchedByFilters, selectedProduct),
    [dataMatchedByFilters, selectedProduct],
  )

  return (
    <AssetsTableContainer>
      <ProductHubFiltersController
        data={dataMatchedByNL}
        initialNetwork={initialNetwork}
        initialProtocol={initialProtocol}
        selectedFilters={selectedFilters}
        selectedProduct={selectedProduct}
        selectedToken={selectedToken}
        onChange={onChange}
      />
      <ProductHubTableController
        rows={limitRows && limitRows > 0 ? rows.slice(0, limitRows) : rows}
      />
    </AssetsTableContainer>
  )
}
