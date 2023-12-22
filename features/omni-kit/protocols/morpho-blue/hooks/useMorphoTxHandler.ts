import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { getRpcProvider } from 'blockchain/networks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { omniMetadataSupplyHandlerGuard } from 'features/omni-kit/helpers'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import {
  getMorphoParameters,
  isMorphoSupportedNetwork,
} from 'features/omni-kit/protocols/morpho-blue/helpers'
import { useAccount } from 'helpers/useAccount'

export function useMorphoTxHandler(): () => void {
  const {
    environment: {
      collateralPrecision,
      collateralPrice,
      quotePrecision,
      quotePrice,
      productType,
      quoteBalance,
      network,
    },
  } = useOmniGeneralContext()
  const {
    form: { state },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata: {
      validations: { isFormValid },
      handlers,
    },
  } = useOmniProductContext(productType)
  const { walletAddress } = useAccount()

  const networkId = network.id

  let onSuccess: (() => void) | undefined = () => null

  if (omniMetadataSupplyHandlerGuard(handlers)) {
    onSuccess = handlers.customReset
  }

  if (!isMorphoSupportedNetwork(networkId)) {
    throw new Error(`Morpho doesn't support this network: ${networkId}`)
  }

  return useOmniTxHandler({
    getOmniParameters: () =>
      getMorphoParameters({
        networkId,
        collateralPrecision,
        collateralPrice,
        isFormValid,
        position: position as MorphoBluePosition,
        quotePrecision,
        quotePrice,
        quoteBalance,
        rpcProvider: getRpcProvider(networkId),
        state,
        walletAddress,
      }),
    onSuccess,
  })
}
