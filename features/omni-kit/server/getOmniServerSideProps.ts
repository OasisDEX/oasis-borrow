import { type NetworkNames, isSupportedNetwork } from 'blockchain/networks'
import { isAddress } from 'ethers/lib/utils'
import type { OmniProductPage } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type { ParsedUrlQuery } from 'querystring'

export async function getOmniServerSideProps({
  isProductPageValid = () => true,
  locale,
  query,
}: {
  locale?: string
  query: ParsedUrlQuery
  isProductPageValid?: (params: OmniProductPage) => boolean
}) {
  const networkName = query.networkOrProduct as NetworkNames
  const [productType, pair, positionId = undefined] = query.position as string[]
  const [collateralToken, quoteToken] = pair.split('-')

  const castedProductType = productType as OmniProductType
  const caseSensitiveCollateralToken = isAddress(collateralToken)
    ? collateralToken.toLowerCase()
    : collateralToken.toUpperCase()
  const caseSensitiveQuoteToken = isAddress(quoteToken)
    ? quoteToken.toLowerCase()
    : quoteToken.toUpperCase()

  const omniProductPage = {
    collateralToken: caseSensitiveCollateralToken,
    networkName,
    positionId,
    productType: castedProductType,
    quoteToken: caseSensitiveQuoteToken,
  }

  if (
    isSupportedNetwork(networkName) &&
    Object.values(OmniProductType).includes(castedProductType) &&
    isProductPageValid(omniProductPage)
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        collateralToken: caseSensitiveCollateralToken,
        networkName,
        positionId,
        productType: castedProductType,
        quoteToken: caseSensitiveQuoteToken,
      },
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: '/not-found',
    },
  }
}
