import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { getRpcProvider } from 'blockchain/networks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import { getAaveLikeParameters } from 'features/omni-kit/protocols/aave-like/helpers'
import { useAccount } from 'helpers/useAccount'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'

export function useAaveLikeTxHandler(): () => void {
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
      collateralToken,
      quoteToken,
      protocol,
      protocolVersion,
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
      getAaveLikeParameters({
        networkId,
        collateralPrecision,
        collateralPrice,
        isFormValid,
        position: position as AaveLikePositionV2,
        quotePrecision,
        quotePrice,
        quoteBalance,
        rpcProvider: getRpcProvider(networkId),
        state,
        walletAddress,
        slippage,
        collateralToken,
        quoteToken,
        protocol: protocol as AaveLikeLendingProtocol,
        protocolVersion,
      }),
  })
}
