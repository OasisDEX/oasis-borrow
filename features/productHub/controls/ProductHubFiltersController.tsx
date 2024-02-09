import type { NetworkIds } from 'blockchain/networks'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { useProductHubFilters } from 'features/productHub/hooks/useProductHubFilters'
import { productHubFiltersCount, productHubGridTemplateColumns } from 'features/productHub/meta'
import type {
  ProductHubFilters,
  ProductHubItem,
  ProductHubQueryString,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Box } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface ProductHubFiltersControllerProps {
  data: ProductHubItem[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters, queryString: ProductHubQueryString) => void
  queryString: ProductHubQueryString
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
  selectedToken: string
}

export const ProductHubFiltersController: FC<ProductHubFiltersControllerProps> = ({
  data,
  initialNetwork = [],
  initialProtocol = [],
  networkId,
  onChange,
  queryString,
  selectedFilters,
  selectedProduct,
  selectedToken,
}) => {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  const {
    debtTokenFilter,
    multiplyStrategyFilter,
    networkFilter,
    protocolFilter,
    secondaryTokenFilter,
  } = useProductHubFilters({
    data,
    onChange,
    queryString,
    selectedFilters,
    selectedToken,
    initialNetwork,
    initialProtocol,
    networkId,
  })

  return (
    <AssetsFiltersContainer
      key={`${selectedProduct}-${selectedToken}`}
      gridTemplateColumns={[
        '100%',
        null,
        `repeat(${productHubFiltersCount[selectedProduct]}, 1fr)`,
        productHubGridTemplateColumns[selectedProduct],
      ]}
    >
      {selectedProduct === ProductHubProductType.Borrow && debtTokenFilter}
      {selectedProduct === ProductHubProductType.Multiply && secondaryTokenFilter}
      {!isSmallerScreen && <Box />}
      {selectedProduct === ProductHubProductType.Multiply && multiplyStrategyFilter}
      {networkFilter}
      {protocolFilter}
    </AssetsFiltersContainer>
  )
}
