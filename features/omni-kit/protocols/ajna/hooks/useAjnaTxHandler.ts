import { getRpcProvider } from 'blockchain/networks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { omniMetadataSupplyHandlerGuard } from 'features/omni-kit/helpers'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { getAjnaParameters } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
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
      networkId,
    },
  } = useOmniGeneralContext()
  const {
    form: { state },
    position: {
      currentPosition: { position, simulation },
      history,
    },
    dynamicMetadata: {
      validations: { isFormValid },
      handlers,
    },
  } = useOmniProductContext(productType)
  const { state: customState } = useAjnaCustomState()
  const { walletAddress } = useAccount()

  let onSuccess: (() => void) | undefined = () => null

  if (omniMetadataSupplyHandlerGuard(handlers)) {
    onSuccess = handlers.customReset
  }

  const castedHistory = history as AjnaHistoryEvent[]

  const lastEventInterestRate =
    castedHistory[0] && 'interestRate' in castedHistory[0]
      ? castedHistory[0].interestRate
      : undefined

  return useOmniTxHandler({
    getOmniParameters: () =>
      getAjnaParameters({
        collateralAddress,
        collateralPrecision,
        collateralPrice,
        collateralToken,
        isFormValid,
        networkId,
        position: position as AjnaGenericPosition,
        price: customState.price,
        quoteAddress,
        quoteBalance,
        quotePrecision,
        quotePrice,
        quoteToken,
        rpcProvider: getRpcProvider(networkId),
        simulation: simulation as AjnaGenericPosition,
        slippage,
        state,
        walletAddress,
        lastEventInterestRate,
      }),
    customState,
    onSuccess,
  })
}
