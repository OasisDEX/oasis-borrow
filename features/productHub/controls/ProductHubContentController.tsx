import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { ProductHubFiltersController } from 'features/productHub/controls/ProductHubFiltersController'
import { ProductHubTableController } from 'features/productHub/controls/ProductHubTableController'
import { matchRowsByFilters, matchRowsByNL, parseRows } from 'features/productHub/helpers'
import { sortByDefault } from 'features/productHub/helpers/sortByDefault'
import { useProductHubBanner } from 'features/productHub/hooks/useProductHubBanner'
import {
  ProductHubFilters,
  ProductHubItem,
  ProductHubProductType,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
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
  const ajnaSafetySwitchOn = useFeatureToggle('AjnaSafetySwitch')

  const banner = useProductHubBanner({
    product: selectedProduct,
  })

  const dataMatchedToFeatureFlags = useMemo(
    () =>
      tableData.filter((row) => {
        if (row.protocol === LendingProtocol.Ajna) return !ajnaSafetySwitchOn
        else return true
      }),
    [ajnaSafetySwitchOn, tableData],
  )
  const dataMatchedByNL = useMemo(
    () => matchRowsByNL(dataMatchedToFeatureFlags, selectedProduct, selectedToken),
    [selectedProduct, selectedToken, dataMatchedToFeatureFlags],
  )
  const dataMatchedByFilters = useMemo(
    () => matchRowsByFilters(dataMatchedByNL, selectedFilters),
    [dataMatchedByNL, selectedFilters],
  )
  const dataSortedByDefault = useMemo(
    () => sortByDefault(dataMatchedByFilters, selectedProduct),
    [dataMatchedByFilters, selectedProduct],
  )
  const rows = useMemo(
    () => parseRows(dataSortedByDefault, selectedProduct),
    [dataSortedByDefault, selectedProduct],
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
        banner={banner}
        rows={limitRows && limitRows > 0 ? rows.slice(0, limitRows) : rows}
      />
    </AssetsTableContainer>
  )
}
