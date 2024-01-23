import { getRpcProvider } from 'blockchain/networks'
import { useMainContext } from 'components/context/MainContextProvider'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import { getAaveLikeParameters } from 'features/omni-kit/protocols/aave-like/helpers/getAaveLikeParameters'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'

export function useAaveLikeSimpleEarnTxHandler(): () => void {
  const {
    environment: {
      collateralPrecision,
      collateralToken,
      productType,
      quoteBalance,
      networkId,
      protocol,
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
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const signer = context?.transactionProvider

  return useOmniTxHandler({
    getOmniParameters: () =>
      getAaveLikeParameters({
        slippage,
        signer,
        rpcProvider: getRpcProvider(networkId),
        protocol,
        networkId,
        collateralPrecision,
        collateralToken,
        isFormValid,
        quoteBalance,
        state,
        walletAddress,
      }),
  })
}
