import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { ProductHubContentController } from 'features/productHub/controls/ProductHubContentController'
import { getInitialFilters, getInitialQueryString } from 'features/productHub/helpers'
import { ALL_ASSETS } from 'features/productHub/meta'
import type { ProductHubFilters, ProductHubQueryString, ProductHubSupportedNetworks } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

export const RefinanceProductTableStep = () => {
  const { productHub: data } = usePreloadAppDataContext()
  const dataParser = (_table) => _table
  const table = dataParser(data.table)
  const initialNetwork = [NetworkNames.ethereumMainnet] as ProductHubSupportedNetworks[]
  const initialProtocol = [LendingProtocol.AaveV3]
  const token = undefined
  const searchParams = useSearchParams()
  const initialQueryString = getInitialQueryString(searchParams)
  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(
    ProductHubProductType.Borrow,
  )
  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>(
    getInitialFilters({
      initialQueryString,
      initialNetwork,
      initialProtocol,
      selectedProduct,
      token,
    }),
  )
  const [selectedToken, setSelectedToken] = useState<string>(token || ALL_ASSETS)
  const [queryString, setQueryString] = useState<ProductHubQueryString>(initialQueryString)

  return (
    <ProductHubContentController
      hiddenColumns={['action']}
      initialNetwork={initialNetwork}
      initialProtocol={initialProtocol}
      limitRows={100}
      networkId={NetworkIds.MAINNET}
      perPage={5}
      queryString={queryString}
      selectedFilters={selectedFilters}
      selectedProduct={selectedProduct}
      selectedToken={selectedToken}
      tableData={table}
      onChange={(_selectedFilters, _queryString) => {
        setSelectedFilters(_selectedFilters)
        setQueryString(_queryString)
      }}
      onRowClick={(item) => console.log(item)}
    />
  )
}
