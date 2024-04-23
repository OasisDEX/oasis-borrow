import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import { ProductHubView } from 'features/productHub/views'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceOptions } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const RefinanceProductTableStep = () => {
  // const { productHub: data } = usePreloadAppDataContext()

  const {
    form: {
      state: { refinanceOption },
      updateState,
    },
    steps: { setNextStep },
  } = useRefinanceContext()

  // const table = getParsedRefinanceProductTable({
  //   table: data.table,
  //   option: refinanceOption,
  //   borrowRate,
  //   isShort,
  //   maxLtv,
  // })

  // const initialNetwork = [NetworkNames.ethereumMainnet] as ProductHubSupportedNetworks[]
  // const initialProtocol = [LendingProtocol.SparkV3]
  // const token = undefined
  // const searchParams = useSearchParams()
  // const initialQueryString = getInitialQueryString(searchParams)

  // const {
  //   steps: { setNextStep },
  //   form: { updateState, state },
  // } = useRefinanceContext()

  const product = {
    [RefinanceOptions.HIGHER_LTV]: OmniProductType.Borrow,
    [RefinanceOptions.LOWER_COST]: OmniProductType.Borrow,
    [RefinanceOptions.CHANGE_DIRECTION]: OmniProductType.Borrow,
    [RefinanceOptions.SWITCH_TO_EARN]: OmniProductType.Earn,
  }[refinanceOption || RefinanceOptions.LOWER_COST]

  // const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>(
  //   getInitialFilters({
  //     initialQueryString,
  //     initialNetwork,
  //     initialProtocol,
  //     selectedProduct,
  //     token,
  //   }),
  // )
  // const [selectedToken] = useState<string>(token || ALL_ASSETS)
  // const [queryString, setQueryString] = useState<ProductHubQueryString>(initialQueryString)

  return (
    <ProductHubView
      product={product}
      hiddenProductTypeSelector
      hiddenCategories
      hiddenHelp
      hiddenTags
      perPage={5}
      hiddenBanners
      initialFilters={{
        protocol: [LendingProtocol.SparkV3],
        network: [NetworkNames.ethereumMainnet],
      }}
      hiddenColumns={['automation']}
      onRowClick={(item) => {
        updateState('strategy', item)
        setNextStep()
      }}
    />
    // <ProductHubContentController
    //   hiddenColumns={['action', 'strategy']}
    //   initialNetwork={initialNetwork}
    //   initialProtocol={initialProtocol}
    //   limitRows={100}
    //   networkId={NetworkIds.MAINNET}
    //   perPage={5}
    //   queryString={queryString}
    //   selectedFilters={selectedFilters}
    //   selectedProduct={selectedProduct}
    //   selectedToken={selectedToken}
    //   tableData={table}
    //   onChange={(_selectedFilters, _queryString) => {
    //     setSelectedFilters(_selectedFilters)
    //     setQueryString(_queryString)
    //   }}
    //   onRowClick={(item) => {
    //     updateState('strategy', item)
    //     setNextStep()
    //   }}
    //   hideBanners
    // />
  )
}
