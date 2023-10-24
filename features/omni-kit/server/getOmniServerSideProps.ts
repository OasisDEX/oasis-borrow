import { type NetworkNames,isSupportedNetwork } from 'blockchain/networks'
import { isAddress } from 'ethers/lib/utils'
import { omniProducts } from 'features/omni-kit/constants'
import type { OmniProduct, OmniProductPage } from 'features/omni-kit/types'
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

  const castedProductType = productType as OmniProduct
  const caseSensitiveCollateralToken = isAddress(collateralToken)
    ? collateralToken.toLowerCase()
    : collateralToken.toUpperCase()
  const caseSensitiveQuoteToken = isAddress(quoteToken)
    ? quoteToken.toLowerCase()
    : quoteToken.toUpperCase()

  const omniProductPage = {
    collateralToken: caseSensitiveCollateralToken,
    positionId,
    networkName,
    productType: castedProductType,
    quoteToken: caseSensitiveQuoteToken,
  }

  if (
    isSupportedNetwork(networkName) &&
    omniProducts.includes(castedProductType) &&
    isProductPageValid(omniProductPage)
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        collateralToken: caseSensitiveCollateralToken,
        positionId,
        networkName,
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
