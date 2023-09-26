import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
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
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { useWalletManagement } from 'features/web3OnBoard'
import { useAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React, { useMemo } from 'react'

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
  const { AjnaSafetySwitch: ajnaSafetySwitchOn, AjnaPoolFinder: ajnaPoolFinderEnabled } =
    useAppConfig('features')

  const { chainId } = useWalletManagement()

  const ajnaOraclessPoolPairsKeys = Object.keys(
    getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaOraclessPoolPairs,
  )

  const banner = useProductHubBanner({
    product: selectedProduct,
  })

  const dataMatchedToFeatureFlags = useMemo(
    () =>
      tableData.filter(({ label, protocol }) => {
        const isAjna = protocol === LendingProtocol.Ajna

        const unalailableChecksList = [
          // these checks predicate that the pool/strategy is UNAVAILABLE
          isAjna && ajnaSafetySwitchOn,
          isAjna &&
            !ajnaPoolFinderEnabled &&
            ajnaOraclessPoolPairsKeys.includes(label.replace('/', '-')),
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
