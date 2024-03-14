import { getRpcProvider } from 'blockchain/networks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import { getErc4626Parameters } from 'features/omni-kit/protocols/erc-4626/helpers'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { useAccount } from 'helpers/useAccount'

export function useErc4626TxHandler(): () => void {
  const {
    environment: {
      label,
      networkId,
      productType,
      quoteAddress,
      quotePrecision,
      quotePrice,
      quoteToken,
      slippage,
    },
  } = useOmniGeneralContext()
  const {
    form: { state },
    dynamicMetadata: {
      validations: { isFormValid },
    },
  } = useOmniProductContext(productType)

  // it is safe to assume that in erc-4626 context label is always availabe string
  const { address } = erc4626VaultsByName[label as string]

  const { walletAddress } = useAccount()

  return useOmniTxHandler({
    getOmniParameters: () =>
      getErc4626Parameters({
        isFormValid,
        state,
        walletAddress,
        networkId,
        quoteAddress,
        quotePrecision,
        quotePrice,
        quoteToken,
        rpcProvider: getRpcProvider(networkId),
        slippage,
        vaultAddress: address,
      }),
  })
}
