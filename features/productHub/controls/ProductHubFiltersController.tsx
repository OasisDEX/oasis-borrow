import type { NetworkIds } from 'blockchain/networks'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { OmniProductType } from 'features/omni-kit/types'
import { ProductHubHelp } from 'features/productHub/components'
import type { ProductHubCustomFiltersOptions } from 'features/productHub/hooks/useProductHubFilters'
import { useProductHubFilters } from 'features/productHub/hooks/useProductHubFilters'
import type { ProductHubFilters, ProductHubItem } from 'features/productHub/types'
import React, { type FC } from 'react'

interface ProductHubFiltersControllerProps {
  data: ProductHubItem[]
  hiddenHelp?: boolean
  hiddenProtocolFilter?: boolean
  hiddenNetworkFilter?: boolean
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters) => void
  selectedFilters: ProductHubFilters
  selectedProduct: OmniProductType
  customFiltersOptions?: ProductHubCustomFiltersOptions
}

export const ProductHubFiltersController: FC<ProductHubFiltersControllerProps> = ({
  data,
  hiddenHelp,
  networkId,
  onChange,
  selectedFilters,
  selectedProduct,
  hiddenProtocolFilter,
  hiddenNetworkFilter,
  customFiltersOptions,
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
    networkId,
    customFiltersOptions,
  })

  return (
    <AssetsFiltersContainer
      key={selectedProduct}
      filters={[
        ...(selectedProduct === OmniProductType.Earn
          ? [depositTokenFilter]
          : [collateralTokenFilter, debtTokenFilter]),
        ...(!hiddenProtocolFilter ? [protocolFilter] : []),
        ...(!hiddenNetworkFilter ? [networkFilter] : []),
      ]}
      lastWithAutoOffset={!hiddenProtocolFilter && !hiddenNetworkFilter}
    >
      {!hiddenHelp && <ProductHubHelp selectedProduct={selectedProduct} />}
    </AssetsFiltersContainer>
  )
}
