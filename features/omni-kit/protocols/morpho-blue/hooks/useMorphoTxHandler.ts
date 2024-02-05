import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { getRpcProvider } from 'blockchain/networks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import { getMorphoParameters } from 'features/omni-kit/protocols/morpho-blue/helpers'
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
      networkId,
      slippage,
    },
  } = useOmniGeneralContext()
  const {
    form: { state },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata: {
      validations: { isFormValid },
    },
  } = useOmniProductContext(productType)
  const { walletAddress } = useAccount()

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
        slippage,
      }),
  })
}
