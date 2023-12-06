import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { ProductHubFiltersController } from 'features/productHub/controls/ProductHubFiltersController'
import { ProductHubTableController } from 'features/productHub/controls/ProductHubTableController'
import { matchRowsByFilters, matchRowsByNL, parseRows } from 'features/productHub/helpers'
import { sortByDefault } from 'features/productHub/helpers/sortByDefault'
import { useProductHubBanner } from 'features/productHub/hooks/useProductHubBanner'
import type {
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
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  queryString: ProductHubQueryString
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
  selectedToken: string
  tableData: ProductHubItem[]
  onChange: (selectedFilters: ProductHubFilters, queryString: ProductHubQueryString) => void
  limitRows?: number
  chainId?: NetworkIds
}

export const ProductHubContentController: FC<ProductHubContentControllerProps> = ({
  initialNetwork = [],
  initialProtocol = [],
  queryString,
  selectedFilters,
  selectedProduct,
  selectedToken,
  tableData,
  onChange,
  limitRows,
  chainId,
}) => {
  const {
    AjnaBase: ajnaBaseEnabled,
    AjnaPoolFinder: ajnaPoolFinderEnabled,
    AjnaSafetySwitch: ajnaSafetySwitchOn,
  } = useAppConfig('features')

  const ajnaOraclessPoolPairsKeys = Object.keys(
    getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaOraclessPoolPairs,
  )

  const banner = useProductHubBanner({
    product: selectedProduct,
  })

  const dataMatchedToFeatureFlags = useMemo(
    () =>
      tableData.filter(({ label, network, protocol }) => {
        const isAjna = protocol === LendingProtocol.Ajna

        const unalailableChecksList = [
          // these checks predicate that the pool/strategy is UNAVAILABLE
          isAjna && ajnaSafetySwitchOn,
          isAjna &&
            !ajnaPoolFinderEnabled &&
            ajnaOraclessPoolPairsKeys.includes(label.replace('/', '-')),
          isAjna && network === NetworkNames.baseMainnet && !ajnaBaseEnabled,
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
    () => parseRows(dataSortedByDefault, selectedProduct, chainId),
    [dataSortedByDefault, selectedProduct],
  )

  return (
    <AssetsTableContainer>
      <ProductHubFiltersController
        data={dataMatchedByNL}
        initialNetwork={initialNetwork}
        initialProtocol={initialProtocol}
        queryString={queryString}
        selectedFilters={selectedFilters}
        selectedProduct={selectedProduct}
        selectedToken={selectedToken}
        onChange={onChange}
        chainId={chainId}
      />
      <ProductHubTableController
        banner={banner}
        rows={limitRows && limitRows > 0 ? rows.slice(0, limitRows) : rows}
      />
    </AssetsTableContainer>
  )
}
