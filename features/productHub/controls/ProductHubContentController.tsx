import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
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
import { useWalletManagement } from 'features/web3OnBoard'
import { getAppConfig } from 'helpers/config'
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
  const {
    AjnaSafetySwitch: ajnaSafetySwitchOn,
    AjnaPoolFinder: ajnaPoolFinderEnabled,
    SparkProtocol: sparkEnabled,
    SparkProtocolBorrow: sparkBorrowEnabled,
    SparkProtocolEarn: sparkEarnEnabled,
    SparkProtocolMultiply: sparkMultiplyEnabled,
    SparkProtocolSDAIETH: sparkSDAIETHEnabled,
  } = getAppConfig('features')

  const { chainId } = useWalletManagement()

  const ajnaOraclessPoolPairsKeys = Object.keys(
    getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaOraclessPoolPairs,
  )

  const banner = useProductHubBanner({
    product: selectedProduct,
  })

  const dataMatchedToFeatureFlags = useMemo(
    () =>
      tableData.filter(({ label, protocol, product, primaryToken, secondaryToken }) => {
        const isAjna = protocol === LendingProtocol.Ajna
        const isSpark = protocol === LendingProtocol.SparkV3

        const isBorrow = product.includes(ProductHubProductType.Borrow)
        const isEarn = product.includes(ProductHubProductType.Earn)
        const isMultiply = product.includes(ProductHubProductType.Multiply)

        const isSDAIETH = primaryToken === 'SDAI' && secondaryToken === 'ETH'

        const unalailableChecksList = [
          // these checks predicate that the pool/strategy is UNAVAILABLE
          isAjna && ajnaSafetySwitchOn,
          isAjna &&
            !ajnaPoolFinderEnabled &&
            ajnaOraclessPoolPairsKeys.includes(label.replace('/', '-')),
          isSpark && isBorrow && !(sparkEnabled && sparkBorrowEnabled),
          isSpark && isEarn && !(sparkEnabled && sparkEarnEnabled),
          isSpark && isMultiply && !(sparkEnabled && sparkMultiplyEnabled),
          isSpark &&
            isSDAIETH &&
            (isMultiply || isBorrow) &&
            !(sparkEnabled && sparkSDAIETHEnabled),
        ]
        if (unalailableChecksList.some((check) => !!check)) {
          return false
        }
        return true
      }),
    [
      tableData,
      sparkEnabled,
      sparkBorrowEnabled,
      sparkEarnEnabled,
      sparkMultiplyEnabled,
      sparkSDAIETHEnabled,
      ajnaSafetySwitchOn,
      ajnaPoolFinderEnabled,
      ajnaOraclessPoolPairsKeys,
    ],
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
