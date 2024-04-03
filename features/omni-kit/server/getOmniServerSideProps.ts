import type { NetworkNames } from 'blockchain/networks'
import { getNetworkByName } from 'blockchain/networks'
import { isAddress } from 'ethers/lib/utils'
import { isOmniSupportedNetworkId } from 'features/omni-kit/helpers'
import { omniProtocolSettings } from 'features/omni-kit/settings'
import type {
  OmniProductPage,
  OmniProductType,
  OmniProtocolSettings,
  OmniSupportedProtocols,
} from 'features/omni-kit/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { uniq } from 'lodash'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type { ParsedUrlQuery } from 'querystring'

interface OmniServerSidePropsWithTokens {
  collateralToken: string
  quoteToken: string
}

interface OmniServerSidePropsWithoutTokens {
  collateralToken?: never
  quoteToken?: never
}

type OmniServerSideProps = (OmniServerSidePropsWithTokens | OmniServerSidePropsWithoutTokens) & {
  extraTokens?: string[]
  isProductPageValid?: (params: OmniProductPage) => boolean
  label?: string
  locale?: string
  protocol: OmniSupportedProtocols
  query: ParsedUrlQuery
  settings: OmniProtocolSettings
}

export async function getOmniServerSideProps({
  collateralToken,
  extraTokens = [],
  isProductPageValid = () => true,
  label,
  locale,
  protocol,
  query,
  quoteToken,
  settings,
}: OmniServerSideProps) {
  const networkId = getNetworkByName(query.networkOrProduct as unknown as NetworkNames).id
  const [productType, pair, positionId] = query.position as string[]
  const castedProductType = productType as OmniProductType

  if (
    !isOmniSupportedNetworkId(networkId, omniProtocolSettings[protocol].supportedNetworkIds) ||
    !settings.supportedProducts.includes(castedProductType) ||
    !pair
  ) {
    return {
      redirect: {
        permanent: false,
        destination: INTERNAL_LINKS.notFound,
      },
    }
  }

  const [paramCollateralToken, paramQuoteToken, pairId = 1] = pair.split('-')

  const resolvedCollateralToken = collateralToken ?? paramCollateralToken
  const resolvedQuoteToken = quoteToken ?? paramQuoteToken

  const caseSensitiveCollateralToken = isAddress(resolvedCollateralToken)
    ? resolvedCollateralToken.toLowerCase()
    : resolvedCollateralToken.toUpperCase()
  const caseSensitiveQuoteToken = isAddress(resolvedQuoteToken)
    ? resolvedQuoteToken.toLowerCase()
    : resolvedQuoteToken.toUpperCase()

  const omniProductPage = {
    collateralToken: caseSensitiveCollateralToken,
    networkId,
    pairId: Number(pairId),
    positionId,
    productType: castedProductType,
    protocol,
    extraTokens: uniq([
      ...extraTokens,
      ...(settings.pullTokens?.[networkId] ?? []),
      ...(settings.returnTokens?.[networkId] ?? []),
    ]),
    quoteToken: caseSensitiveQuoteToken,
  }

  if (!isProductPageValid(omniProductPage)) {
    return {
      redirect: {
        permanent: false,
        destination: INTERNAL_LINKS.notFound,
      },
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...omniProductPage,
      label: label ?? null,
      positionId: positionId ?? null,
      version: query.version ?? null,
    },
  }
}
