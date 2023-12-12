import { getRpcProvider } from 'blockchain/networks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { omniMetadataSupplyHandlerGuard } from 'features/omni-kit/helpers'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { getAjnaParameters, isAjnaSupportedNetwork } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import { useAccount } from 'helpers/useAccount'

export function useAjnaTxHandler(): () => void {
  const {
    environment: {
      collateralAddress,
      collateralPrecision,
      collateralPrice,
      collateralToken,
      quoteAddress,
      quotePrecision,
      quotePrice,
      quoteToken,
      productType,
      slippage,
      quoteBalance,
      network,
    },
  } = useOmniGeneralContext()
  const {
    form: { state },
    position: {
      currentPosition: { position, simulation },
    },
    dynamicMetadata: {
      validations: { isFormValid },
      handlers,
    },
  } = useOmniProductContext(productType)
  const { state: customState } = useAjnaCustomState()
  const { walletAddress } = useAccount()

  const networkId = network.id

  let onSuccess: (() => void) | undefined = () => null

  if (omniMetadataSupplyHandlerGuard(handlers)) {
    onSuccess = handlers.customReset
  }

  if (!isAjnaSupportedNetwork(networkId)) {
    throw new Error(`Ajna doesn't support this network: ${networkId}`)
  }

  return useOmniTxHandler({
    getOmniParameters: () =>
      getAjnaParameters({
        networkId,
        collateralAddress,
        collateralPrecision,
        collateralPrice,
        collateralToken,
        isFormValid,
        position: position as AjnaGenericPosition,
        simulation: simulation as AjnaGenericPosition,
        quoteAddress,
        quotePrecision,
        quotePrice,
        quoteToken,
        quoteBalance,
        rpcProvider: getRpcProvider(networkId),
        slippage,
        state,
        price: customState.price,
        walletAddress,
      }),
    customState,
    onSuccess,
  })
}
