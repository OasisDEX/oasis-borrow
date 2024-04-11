import type { NetworkIds } from 'blockchain/networks'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { useProductHubFilters } from 'features/productHub/hooks/useProductHubFilters'
import type {
  ProductHubFilters,
  ProductHubItem,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import {
  ProductHubProductType } from 'features/productHub/types';
import type { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'

interface ProductHubFiltersControllerProps {
  data: ProductHubItem[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters) => void
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
}

export const ProductHubFiltersController: FC<ProductHubFiltersControllerProps> = ({
  data,
  initialNetwork = [],
  initialProtocol = [],
  networkId,
  onChange,
  selectedFilters,
  selectedProduct,
}) => {
  // const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  const {
    collateralTokenFilter,
    debtTokenFilter,
    depositTokenFilter,
    networkFilter,
    protocolFilter,
  } = useProductHubFilters({
    data,
    onChange,
    selectedFilters,
    initialNetwork,
    initialProtocol,
    networkId,
  })

  return (
    <AssetsFiltersContainer
      key={selectedProduct}
      filters={[
        ...(selectedProduct === ProductHubProductType.Earn
          ? [depositTokenFilter]
          : [collateralTokenFilter, debtTokenFilter]),
        protocolFilter,
        networkFilter,
      ]}
    />
  )
}
