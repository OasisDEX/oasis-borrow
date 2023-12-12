import { networksById } from 'blockchain/networks'
import { isPoolSupportingMultiply } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaSupportedNetworksIds } from 'features/omni-kit/protocols/ajna/types'
import { OmniProductType } from 'features/omni-kit/types'
import { useRouter } from 'next/router'

// TODO this interface won't be protocol specific and could be easily extended with the rest of protocol data
export interface AjnaRedirectProps {
  collateralToken?: string
  isOracless: boolean
  networkId: AjnaSupportedNetworksIds
  productType?: OmniProductType
  quoteToken?: string
}

export function useAjnaRedirect({
  collateralToken,
  isOracless,
  networkId,
  productType,
  quoteToken,
}: AjnaRedirectProps) {
  const { replace } = useRouter()

  // check redirects only if dpmPosition is loaded
  if (productType && collateralToken && quoteToken) {
    // redirect to borrow is multiply is open when it's not allowed
    if (
      isOracless ||
      (productType === OmniProductType.Multiply &&
        !isPoolSupportingMultiply({ collateralToken, networkId, quoteToken }))
    )
      void replace(`/${networksById[networkId].name}/ajna/borrow/${collateralToken}-${quoteToken}`)
  }
}
