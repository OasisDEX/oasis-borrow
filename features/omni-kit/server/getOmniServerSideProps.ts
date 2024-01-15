import type { NetworkNames } from 'blockchain/networks'
import { getNetworkByName } from 'blockchain/networks'
import { isAddress } from 'ethers/lib/utils'
import { isOmniSupportedNetworkId } from 'features/omni-kit/helpers'
import { omniProtocolSettings } from 'features/omni-kit/settings'
import type {
  OmniProductPage,
  OmniProductType,
  OmniSupportedProtocols,
} from 'features/omni-kit/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type { ParsedUrlQuery } from 'querystring'

export async function getOmniServerSideProps({
  isProductPageValid = () => true,
  locale,
  protocol,
  query,
}: {
  isProductPageValid?: (params: OmniProductPage) => boolean
  locale?: string
  protocol: OmniSupportedProtocols
  query: ParsedUrlQuery
}) {
  const networkId = getNetworkByName(query.networkOrProduct as unknown as NetworkNames).id
  const [productType, pair, positionId] = query.position as string[]
  const castedProductType = productType as OmniProductType

  if (
    !isOmniSupportedNetworkId(networkId, omniProtocolSettings[protocol].supportedNetworkIds) ||
    !omniProtocolSettings[protocol].supportedProducts.includes(castedProductType) ||
    !pair
  ) {
    return {
      redirect: {
        permanent: false,
        destination: '/not-found',
      },
    }
  }

  const [collateralToken, quoteToken] = pair.split('-')
  const caseSensitiveCollateralToken = isAddress(collateralToken)
    ? collateralToken.toLowerCase()
    : collateralToken.toUpperCase()
  const caseSensitiveQuoteToken = isAddress(quoteToken)
    ? quoteToken.toLowerCase()
    : quoteToken.toUpperCase()

  const omniProductPage = {
    collateralToken: caseSensitiveCollateralToken,
    networkId,
    positionId,
    productType: castedProductType,
    quoteToken: caseSensitiveQuoteToken,
  }

  if (!isProductPageValid(omniProductPage)) {
    return {
      redirect: {
        permanent: false,
        destination: '/not-found',
      },
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...omniProductPage,
      positionId: positionId ?? null,
    },
  }
}
