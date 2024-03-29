import { EarnStrategies } from '@prisma/client'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
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
  ProductHubQueryString,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { useAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React, { useMemo } from 'react'

interface ProductHubContentControllerProps {
  hiddenColumns?: ProductHubColumnKey[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  limitRows?: number
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters, queryString: ProductHubQueryString) => void
  onRowClick?: (row: ProductHubItem) => void
  perPage?: number
  queryString: ProductHubQueryString
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
  selectedToken: string
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
  queryString,
  selectedFilters,
  selectedProduct,
  selectedToken,
  tableData,
}) => {
  const {
    AjnaBase: ajnaBaseEnabled,
    AjnaPoolFinder: ajnaPoolFinderEnabled,
    AjnaSafetySwitch: ajnaSafetySwitchOn,
    MorphoBlue: morphoBlueEnabled,
    Erc4626Vaults: erc4626VaultsEnabled,
  } = useAppConfig('features')

  const ajnaOraclessPoolPairsKeys = Object.keys(
    getNetworkContracts(NetworkIds.MAINNET, networkId).ajnaOraclessPoolPairs,
  )

  const banner = useProductHubBanner({
    filters: selectedFilters,
    product: selectedProduct,
  })

  const dataMatchedToFeatureFlags = useMemo(
    () =>
      tableData.filter(({ earnStrategy, label, network, protocol }) => {
        const isAjna = protocol === LendingProtocol.Ajna
        const isMorpho = protocol === LendingProtocol.MorphoBlue
        const isErc4626 = earnStrategy === EarnStrategies.erc_4626

        const unalailableChecksList = [
          // these checks predicate that the pool/strategy is UNAVAILABLE
          isAjna && ajnaSafetySwitchOn,
          isAjna &&
            !ajnaPoolFinderEnabled &&
            ajnaOraclessPoolPairsKeys.includes(label.replace('/', '-')),
          isAjna && network === NetworkNames.baseMainnet && !ajnaBaseEnabled,
          isMorpho && !morphoBlueEnabled,
          isErc4626 && !erc4626VaultsEnabled,
        ]
        if (unalailableChecksList.some((check) => !!check)) {
          return false
        }
        return true
      }),
    [tableData, ajnaSafetySwitchOn, ajnaPoolFinderEnabled, ajnaOraclessPoolPairsKeys],
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
        queryString={queryString}
        selectedFilters={selectedFilters}
        selectedProduct={selectedProduct}
        selectedToken={selectedToken}
      />
      <ProductHubTableController
        banner={banner}
        perPage={perPage}
        rows={limitRows && limitRows > 0 ? rows.slice(0, limitRows) : rows}
      />
    </AssetsTableContainer>
  )
}
