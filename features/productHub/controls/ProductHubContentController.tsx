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
  filterByProductType,
  filterByUserFilters,
  parseRows,
  sortByDefault,
} from 'features/productHub/helpers'
import { useProductHubBanner } from 'features/productHub/hooks'
import type {
  ProductHubColumnKey,
  ProductHubFeaturedFilters,
  ProductHubFilters,
  ProductHubItem,
} from 'features/productHub/types'
import { useAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import React, { type FC, useMemo } from 'react'

interface ProductHubContentControllerProps {
  featured?: ProductHubFeaturedFilters[]
  hiddenColumns?: ProductHubColumnKey[]
  hiddenHelp?: boolean
  highlighted?: ProductHubFeaturedFilters[]
  limitRows?: number
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters) => void
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  selectedFilters: ProductHubFilters
  selectedProduct: OmniProductType
  separator?: AssetsTableSeparator
  stickied?: ProductHubFeaturedFilters[]
  tableData: ProductHubItem[]
}

export const ProductHubContentController: FC<ProductHubContentControllerProps> = ({
  featured,
  hiddenColumns,
  hiddenHelp,
  highlighted,
  limitRows,
  networkId,
  onChange,
  onRowClick,
  perPage,
  selectedFilters,
  selectedProduct,
  separator,
  stickied,
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
  const dataFilteredByProductType = useMemo(
    () => filterByProductType(dataFilteredByFeatureFlags, selectedProduct),
    [selectedProduct, dataFilteredByFeatureFlags],
  )
  const dataFilteredByUserFilters = useMemo(
    () => filterByUserFilters(dataFilteredByProductType, selectedFilters, stickied),
    [dataFilteredByProductType, selectedFilters, stickied],
  )
  const dataSortedByDefault = useMemo(
    () => sortByDefault(dataFilteredByUserFilters, selectedProduct),
    [dataFilteredByUserFilters, selectedProduct],
  )
  const rows = useMemo(
    () =>
      parseRows({
        featured,
        hiddenColumns,
        highlighted,
        networkId,
        onRowClick,
        product: selectedProduct,
        rows: dataSortedByDefault,
        stickied,
      }),
    [
      dataSortedByDefault,
      featured,
      hiddenColumns,
      highlighted,
      networkId,
      onRowClick,
      selectedProduct,
      stickied,
    ],
  )

  return (
    <>
      <ProductHubCategoryController
        onChange={onChange}
        selectedFilters={selectedFilters}
        selectedProduct={selectedProduct}
      />
      <AssetsTableContainer>
        <ProductHubFiltersController
          data={dataFilteredByProductType}
          hiddenHelp={hiddenHelp}
          networkId={networkId}
          onChange={onChange}
          selectedFilters={selectedFilters}
          selectedProduct={selectedProduct}
        />
        <ProductHubTagsController
          onChange={onChange}
          selectedFilters={selectedFilters}
          selectedProduct={selectedProduct}
        />
        <ProductHubTableController
          banner={banner}
          perPage={perPage}
          rows={limitRows && limitRows > 0 ? rows.slice(0, limitRows) : rows}
          separator={separator}
        />
      </AssetsTableContainer>
    </>
  )
}
