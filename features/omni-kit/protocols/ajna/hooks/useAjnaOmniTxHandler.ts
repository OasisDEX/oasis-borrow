import type { Context } from 'blockchain/network.types'
import { getRpcProvider } from 'blockchain/networks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { getAjnaOmniParameters } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'

export function useAjnaOmniTxHandler(): () => void {
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
    },
  } = useOmniGeneralContext()
  const {
    form: { state },
    position: {
      currentPosition: { position, simulation },
    },
    dynamicMetadata: {
      validations: { isFormValid },
    },
  } = useOmniProductContext(productType)
  const { state: customState, dispatch: customDispatch } = useAjnaCustomState()

  return useOmniTxHandler({
    getOmniParameters: (context: Context) =>
      getAjnaOmniParameters({
        chainId: context.chainId,
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
        rpcProvider: getRpcProvider(context.chainId),
        slippage,
        state,
        price: customState.price,
        walletAddress: context.account,
      }),
    customState,
    onSuccess: () => customDispatch({ type: 'reset' }),
  })
}
