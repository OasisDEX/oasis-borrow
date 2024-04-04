import type { NetworkNames } from 'blockchain/networks'
import { getNetworkByName } from 'blockchain/networks'
import { isAddress } from 'ethers/lib/utils'
import { isOmniSupportedNetworkId } from 'features/omni-kit/helpers'
import { omniProtocolSettings } from 'features/omni-kit/settings'
import type {
  OmniProductPage,
  OmniProtocolSettings,
  OmniSupportedProtocols,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
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
  let castedProductType = productType as OmniProductType
  if (
    [LendingProtocol.AaveV2, LendingProtocol.AaveV3, LendingProtocol.SparkV3].includes(protocol)
  ) {
    // on aave-like we dont want to display the earn UI, we use multiply UI for this
    castedProductType =
      productType === OmniProductType.Earn ? OmniProductType.Multiply : castedProductType
  }

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

  const [resolvedCollateralToken, resolvedQuoteToken] =
    collateralToken && quoteToken ? [collateralToken, quoteToken] : pair.split('-')
  const caseSensitiveCollateralToken = isAddress(resolvedCollateralToken)
    ? resolvedCollateralToken.toLowerCase()
    : resolvedCollateralToken.toUpperCase()
  const caseSensitiveQuoteToken = isAddress(resolvedQuoteToken)
    ? resolvedQuoteToken.toLowerCase()
    : resolvedQuoteToken.toUpperCase()

  const omniProductPage = {
    collateralToken: caseSensitiveCollateralToken,
    networkId,
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
