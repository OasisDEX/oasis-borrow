import { networkNameToIdMap } from 'blockchain/networks'
import { getOmniRawProtocol } from 'features/omni-kit/helpers'
import { aaveLikeFlowStateFilter } from 'features/omni-kit/protocols/aave-like/helpers'
import { ajnaFlowStateFilter } from 'features/omni-kit/protocols/ajna/helpers'
import { settings as ajnaSettings } from 'features/omni-kit/protocols/ajna/settings'
import { morphoFlowStateFilter } from 'features/omni-kit/protocols/morpho-blue/helpers'
import type {
  OmniFiltersParameters,
  OmniProductType,
  OmniSupportedNetworkIds,
} from 'features/omni-kit/types'
import { getRefinanceNewProductType } from 'features/refinance/helpers'
import type { RefinanceFormState } from 'features/refinance/state/refinanceFormReducto.types'
import { LendingProtocol } from 'lendingProtocols'

export const getRefinanceFlowStateFilter = ({
  filterConsumed,
  event,
  formState,
  currentProductType,
}: OmniFiltersParameters & {
  currentProductType: OmniProductType
  formState: RefinanceFormState
}) => {
  if (!formState.strategy || !formState.refinanceOption) {
    return Promise.resolve(false)
  }

  const { protocol, primaryTokenAddress, secondaryTokenAddress, network, label } =
    formState.strategy

  const networkId = networkNameToIdMap[network]

  const productType = getRefinanceNewProductType({
    currentType: currentProductType,
    refinanceOption: formState.refinanceOption,
  })

  const collateralAddress = primaryTokenAddress
  const quoteAddress = secondaryTokenAddress

  const pairId = Number(label.split('-')[1] || 1)

  switch (protocol) {
    case LendingProtocol.AaveV2:
    case LendingProtocol.AaveV3:
    case LendingProtocol.SparkV3:
      return aaveLikeFlowStateFilter({
        event,
        filterConsumed,
        protocol,
        collateralAddress,
        quoteAddress,
        networkId,
        pairId,
        productType,
      })
    case LendingProtocol.Ajna:
      return ajnaFlowStateFilter({
        collateralAddress,
        event,
        filterConsumed,
        pairId,
        productType,
        protocol,
        protocolRaw: getOmniRawProtocol({
          settings: ajnaSettings,
          networkId: networkId as OmniSupportedNetworkIds,
        }),
        quoteAddress,
      })
    case LendingProtocol.MorphoBlue:
      return morphoFlowStateFilter({
        collateralAddress,
        event,
        filterConsumed,
        pairId,
        productType,
        protocol,
        quoteAddress,
      })
    default:
      return Promise.resolve(false)
  }
}
