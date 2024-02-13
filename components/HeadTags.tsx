import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getRandomString } from 'helpers/getRandomString'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface SEOTagsType {
  readonly title: string
  readonly description: string
  readonly url?: string
  readonly ogImage?: string
  readonly twitterImage?: string
  readonly titleParams?: Record<string, string>
}

const getOgImages = (url: string, ogImageParsed: string, twitterImageParsed: string) => {
  if (url.includes('better-on-summer')) {
    // if the url changes this should be updated
    // im assuming the url is /better-on-summer/xxxx
    const parsedPageName = url.replace('better-on-summer', '').split('/').filter(Boolean)[0]
    return {
      ogImageParsed: staticFilesRuntimeUrl(
        `/static/img/og_images/${parsedPageName}.png?${getRandomString()}`,
      ),
      twitterImageParsed: staticFilesRuntimeUrl(
        `/static/img/og_images/${parsedPageName}.png?${getRandomString()}`,
      ),
    }
  }
  const staticOgImageParseds = {
    [INTERNAL_LINKS.borrow]: {
      ogImageParsed: staticFilesRuntimeUrl(
        `/static/img/og_images/og_borrow.jpg?${getRandomString()}`,
      ),
      twitterImageParsed: staticFilesRuntimeUrl(
        `/static/img/og_images/twitter_preview_borrow.jpg?${getRandomString()}`,
      ),
    },
    [INTERNAL_LINKS.multiply]: {
      ogImageParsed: staticFilesRuntimeUrl(
        `/static/img/og_images/og_multiply.jpg?${getRandomString()}`,
      ),
      twitterImageParsed: staticFilesRuntimeUrl(
        `/static/img/og_images/twitter_preview_multiply.jpg?${getRandomString()}`,
      ),
    },
    [INTERNAL_LINKS.earn]: {
      ogImageParsed: staticFilesRuntimeUrl(
        `/static/img/og_images/og_earn.jpg?${getRandomString()}`,
      ),
      twitterImageParsed: staticFilesRuntimeUrl(
        `/static/img/og_images/twitter_preview_earn.jpg?${getRandomString()}`,
      ),
    },
  }[url]

  return staticOgImageParseds ?? { ogImageParsed, twitterImageParsed }
}

export function PageSEONoFollow() {
  return (
    <Head>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  )
}

export function PageSEOTags({
  title,
  titleParams,
  description,
  url = INTERNAL_LINKS.homepage,
  ogImage = 'og_default.jpg',
  twitterImage = 'twitter_preview_default.jpg',
}: SEOTagsType) {
  const { t } = useTranslation()

  const { ogImageParsed, twitterImageParsed } = getOgImages(url, ogImage, twitterImage)
  // TODO: Add Icon to the title
  const tabTitle = `${titleParams ? t(title, titleParams) : t(title)}`

  return (
    <Head>
      <title>{tabTitle}</title>
      <meta property="og:title" content={t(title)} />
      <meta property="twitter:title" content={t(title)} />

      <meta name="description" content={t(description)} />
      <meta property="og:description" content={t(description)} />
      <meta property="twitter:description" content={t(description)} />

      <meta name="robots" content="index, follow" />
      <meta
        name="googlebot"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta
        name="bingbot"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />

      <meta property="og:url" content={`${INTERNAL_LINKS.appUrl}${url}`} />
      <link rel="canonical" href={`${INTERNAL_LINKS.appUrl}${url}`} />

      <meta property="og:image" key="og:image" content={ogImageParsed} />
      <meta property="og:image:secure_url" key="og:image:secure_url" content={ogImageParsed} />
      <meta name="twitter:image" key="twitter:image" content={twitterImageParsed} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@Summerfi_" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Summer.fi" />
      <meta
        name="keywords"
        content="dapp, dao, maker, protocol, vaults, ethereum, wallet, staking, yield, farming, apy, arbitrage, liquidity, L2, L3, lending, trade, buy, protection, safe, blockchain, best, earn, passive, income, profit, bear, bull, winter, 2023"
      />
    </Head>
  )
}
