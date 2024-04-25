import { EarnStrategies } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import { NetworkNames } from 'blockchain/networks'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import type { AssetsTableSeparator } from 'components/assetsTable/types'
import type { OmniProductType } from 'features/omni-kit/types'
import {
  ProductHubCategoryController,
  ProductHubFiltersController,
  ProductHubTableController,
  ProductHubTagsController,
} from 'features/productHub/controls'
import {
  filterByDatabaseQuery,
  filterByProductType,
  filterByUserFilters,
  parseRows,
  sortByDefault,
} from 'features/productHub/helpers'
import { useProductHubBanner } from 'features/productHub/hooks/useProductHubBanner'
import type {
  ProductHubColumnKey,
  ProductHubDatabaseQuery,
  ProductHubFeaturedProducts,
  ProductHubFilters,
  ProductHubItem,
} from 'features/productHub/types'
import { useAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import React, { type FC, useMemo } from 'react'

interface ProductHubContentControllerProps {
  databaseQuery?: ProductHubDatabaseQuery
  customSortByDefault?: (tableData: ProductHubItem[]) => ProductHubItem[]
  featured: ProductHubFeaturedProducts
  hiddenBanners?: boolean
  hiddenCategories?: boolean
  hiddenColumns?: ProductHubColumnKey[]
  hiddenHelp?: boolean
  hiddenTags?: boolean
  hiddenProtocolFilter?: boolean
  hiddenNetworkFilter?: boolean
  limitRows?: number
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters) => void
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  selectedFilters: ProductHubFilters
  selectedProduct: OmniProductType
  separator?: AssetsTableSeparator
  tableData: ProductHubItem[]
}

export const ProductHubContentController: FC<ProductHubContentControllerProps> = ({
  databaseQuery,
  customSortByDefault,
  featured,
  hiddenBanners,
  hiddenCategories,
  hiddenColumns,
  hiddenHelp,
  hiddenTags,
  hiddenProtocolFilter,
  hiddenNetworkFilter,
  limitRows,
  networkId,
  onChange,
  onRowClick,
  perPage,
  selectedFilters,
  selectedProduct,
  separator,
  tableData,
}) => {
  const {
    AjnaBase: ajnaBaseEnabled,
    AjnaSafetySwitch: ajnaSafetySwitchOn,
    Erc4626Vaults: erc4626VaultsEnabled,
    MorphoBlue: morphoBlueEnabled,
  } = useAppConfig('features')

  const banner = useProductHubBanner({
    filters: selectedFilters,
    hidden: !!hiddenBanners,
    selectedProduct: selectedProduct,
  })

  const dataFilteredByFeatureFlags = useMemo(
    () =>
      tableData.filter(({ earnStrategy, network, protocol }) => {
        const isAjna = protocol === LendingProtocol.Ajna
        const isMorpho = protocol === LendingProtocol.MorphoBlue
        const isErc4626 = earnStrategy === EarnStrategies.erc_4626

        const unavailableChecksList = [
          // these checks predicate that the pool/strategy is UNAVAILABLE
          isAjna && ajnaSafetySwitchOn,
          isAjna && network === NetworkNames.baseMainnet && !ajnaBaseEnabled,
          isMorpho && !morphoBlueEnabled,
          isErc4626 && !erc4626VaultsEnabled,
        ]
        if (unavailableChecksList.some((check) => !!check)) {
          return false
        }
        return true
      }),
    [tableData, ajnaSafetySwitchOn, ajnaBaseEnabled, morphoBlueEnabled, erc4626VaultsEnabled],
  )
  const dataFilteredByDatabaseQuery = useMemo(
    () =>
      databaseQuery
        ? filterByDatabaseQuery(dataFilteredByFeatureFlags, databaseQuery)
        : dataFilteredByFeatureFlags,
    [databaseQuery, dataFilteredByFeatureFlags],
  )
  const dataFilteredByProductType = useMemo(
    () => filterByProductType(dataFilteredByDatabaseQuery, selectedProduct),
    [dataFilteredByDatabaseQuery, selectedProduct],
  )
  const dataFilteredByUserFilters = useMemo(
    () =>
      filterByUserFilters(dataFilteredByProductType, selectedFilters, selectedProduct, featured),
    [dataFilteredByProductType, selectedFilters, selectedProduct, featured],
  )
  const dataSortedByDefault = useMemo(
    () =>
      customSortByDefault
        ? customSortByDefault(dataFilteredByUserFilters)
        : sortByDefault(dataFilteredByUserFilters, selectedProduct),
    [customSortByDefault, dataFilteredByUserFilters, selectedProduct],
  )
  const rows = useMemo(
    () =>
      parseRows({
        featured,
        hiddenColumns,
        networkId,
        onRowClick,
        product: selectedProduct,
        rows: dataSortedByDefault,
      }),
    [dataSortedByDefault, featured, hiddenColumns, networkId, onRowClick, selectedProduct],
  )

  const separatorResolved = useMemo(
    () =>
      separator ? ('index' in separator ? separator : separator(dataSortedByDefault)) : undefined,
    [dataSortedByDefault, separator],
  )

  return (
    <>
      {!hiddenCategories && (
        <ProductHubCategoryController
          onChange={onChange}
          selectedFilters={selectedFilters}
          selectedProduct={selectedProduct}
        />
      )}
      <AssetsTableContainer>
        <ProductHubFiltersController
          data={dataFilteredByProductType}
          hiddenHelp={hiddenHelp}
          networkId={networkId}
          onChange={onChange}
          selectedFilters={selectedFilters}
          selectedProduct={selectedProduct}
          hiddenProtocolFilter={hiddenProtocolFilter}
          hiddenNetworkFilter={hiddenNetworkFilter}
        />
        {!hiddenTags && (
          <ProductHubTagsController
            onChange={onChange}
            selectedFilters={selectedFilters}
            selectedProduct={selectedProduct}
          />
        )}
        <ProductHubTableController
          banner={banner}
          limitRows={limitRows}
          perPage={perPage}
          rows={rows}
          separator={separatorResolved}
        />
      </AssetsTableContainer>
    </>
  )
}
