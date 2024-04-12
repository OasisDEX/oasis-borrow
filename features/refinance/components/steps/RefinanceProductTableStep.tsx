import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { ProductHubContentController } from 'features/productHub/controls/ProductHubContentController'
import { getInitialFilters, getInitialQueryString } from 'features/productHub/helpers'
import { ALL_ASSETS } from 'features/productHub/meta'
import type {
  ProductHubFilters,
  ProductHubQueryString,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { useRefinanceContext } from 'features/refinance/contexts'
import { getParsedRefinanceProductTable } from 'features/refinance/helpers'
import { RefinanceOptions } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

export const RefinanceProductTableStep = () => {
  const { productHub: data } = usePreloadAppDataContext()

  const {
    poolData: { borrowRate, maxLtv },
    position: { isShort },
    form: {
      state: { refinanceOption },
    },
  } = useRefinanceContext()

  const table = getParsedRefinanceProductTable({
    table: data.table,
    option: refinanceOption,
    borrowRate,
    isShort,
    maxLtv,
  })

  const initialNetwork = [NetworkNames.ethereumMainnet] as ProductHubSupportedNetworks[]
  const initialProtocol = [LendingProtocol.SparkV3]
  const token = undefined
  const searchParams = useSearchParams()
  const initialQueryString = getInitialQueryString(searchParams)

  const {
    steps: { setNextStep },
    form: { updateState, state },
  } = useRefinanceContext()

  const selectedProduct = {
    [RefinanceOptions.HIGHER_LTV]: ProductHubProductType.Borrow,
    [RefinanceOptions.LOWER_COST]: ProductHubProductType.Borrow,
    [RefinanceOptions.CHANGE_DIRECTION]: ProductHubProductType.Borrow,
    [RefinanceOptions.SWITCH_TO_EARN]: ProductHubProductType.Earn,
  }[state.refinanceOption || RefinanceOptions.LOWER_COST]

  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>(
    getInitialFilters({
      initialQueryString,
      initialNetwork,
      initialProtocol,
      selectedProduct,
      token,
    }),
  )
  const [selectedToken] = useState<string>(token || ALL_ASSETS)
  const [queryString, setQueryString] = useState<ProductHubQueryString>(initialQueryString)

  return (
    <ProductHubContentController
      hiddenColumns={['action', 'strategy']}
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
      onRowClick={(item) => {
        updateState('strategy', item)
        setNextStep()
      }}
    />
  )
}
