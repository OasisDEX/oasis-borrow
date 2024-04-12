import type { NetworkIds } from 'blockchain/networks'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { OmniProductType } from 'features/omni-kit/types'
import { useProductHubFilters } from 'features/productHub/hooks'
import type {
  ProductHubFilters,
  ProductHubItem,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'
import React, { type FC } from 'react'

interface ProductHubFiltersControllerProps {
  data: ProductHubItem[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters) => void
  selectedFilters: ProductHubFilters
  selectedProduct: OmniProductType
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
        ...(selectedProduct === OmniProductType.Earn
          ? [depositTokenFilter]
          : [collateralTokenFilter, debtTokenFilter]),
        protocolFilter,
        networkFilter,
      ]}
    />
  )
}
