import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniTxHandler } from 'features/omni-kit/hooks'
import { getErc4626Parameters } from 'features/omni-kit/protocols/erc-4626/helpers'
import { useAccount } from 'helpers/useAccount'

export function useErc4626TxHandler(): () => void {
  const {
    environment: {
      productType,
    },
  } = useOmniGeneralContext()
  const {
    form: { state },
    dynamicMetadata: {
      validations: { isFormValid },
    },
  } = useOmniProductContext(productType)
  const { walletAddress } = useAccount()

  return useOmniTxHandler({
    getOmniParameters: () =>
      getErc4626Parameters({
        isFormValid,
        state,
        walletAddress,
      }),
  })
}
