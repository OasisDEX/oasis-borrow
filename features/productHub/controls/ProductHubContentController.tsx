import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { ProductHubFiltersController } from 'features/productHub/controls/ProductHubFiltersController'
import { ProductHubTableController } from 'features/productHub/controls/ProductHubTableController'
import { matchRowsByFilters, matchRowsByNL, parseRows } from 'features/productHub/helpers'
import { ProductHubFilters, ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import React, { FC, useMemo } from 'react'

interface ProductHubContentControllerProps {
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
  selectedToken: string
  tableData: ProductHubItem[]
  onChange: (selectedFilters: ProductHubFilters) => void
}

export const ProductHubContentController: FC<ProductHubContentControllerProps> = ({
  selectedFilters,
  selectedProduct,
  selectedToken,
  tableData,
  onChange,
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
        selectedFilters={selectedFilters}
        selectedProduct={selectedProduct}
        selectedToken={selectedToken}
        onChange={onChange}
      />
      <ProductHubTableController rows={rows} />
    </AssetsTableContainer>
  )
}
