import { EarnStrategies } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import { NetworkNames } from 'blockchain/networks'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { ProductHubFiltersController } from 'features/productHub/controls/ProductHubFiltersController'
import { ProductHubTableController } from 'features/productHub/controls/ProductHubTableController'
import { matchRowsByFilters, matchRowsByNL, parseRows } from 'features/productHub/helpers'
import { sortByDefault } from 'features/productHub/helpers/sortByDefault'
import { useProductHubBanner } from 'features/productHub/hooks/useProductHubBanner'
import type {
  ProductHubColumnKey,
  ProductHubFilters,
  ProductHubItem,
  ProductHubProductType,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { useAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import React, { type FC, useMemo } from 'react'

interface ProductHubContentControllerProps {
  hiddenColumns?: ProductHubColumnKey[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  limitRows?: number
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters) => void
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
  tableData: ProductHubItem[]
}

export const ProductHubContentController: FC<ProductHubContentControllerProps> = ({
  hiddenColumns,
  initialNetwork = [],
  initialProtocol = [],
  limitRows,
  networkId,
  onChange,
  onRowClick,
  perPage,
  selectedFilters,
  selectedProduct,
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
    product: selectedProduct,
  })

  const dataMatchedToFeatureFlags = useMemo(
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
  const dataMatchedByNL = useMemo(
    () => matchRowsByNL(dataMatchedToFeatureFlags, selectedProduct),
    [selectedProduct, dataMatchedToFeatureFlags],
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
    () =>
      parseRows({
        hiddenColumns,
        networkId,
        onRowClick,
        product: selectedProduct,
        rows: dataSortedByDefault,
      }),
    [dataSortedByDefault, selectedProduct],
  )

  return (
    <AssetsTableContainer>
      <ProductHubFiltersController
        data={dataMatchedByNL}
        initialNetwork={initialNetwork}
        initialProtocol={initialProtocol}
        networkId={networkId}
        onChange={onChange}
        selectedFilters={selectedFilters}
        selectedProduct={selectedProduct}
      />
      <ProductHubTableController
        banner={banner}
        perPage={perPage}
        rows={limitRows && limitRows > 0 ? rows.slice(0, limitRows) : rows}
      />
    </AssetsTableContainer>
  )
}
