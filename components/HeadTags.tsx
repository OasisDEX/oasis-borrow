import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getRandomString } from 'helpers/getRandomString'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import React from 'react'

export function HeadTags() {
  return (
    <Head>
      <link href={EXTERNAL_LINKS.INTER_FONT} rel="stylesheet" />
      <link rel="shortcut icon" href={staticFilesRuntimeUrl('/static/favicon.ico')} />
    </Head>
  )
}

interface SEOTagsType {
  title: string
  description: string
  url?: string
  ogImage?: string
  twitterImage?: string
  titleParams?: Record<string, string>
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
  ogImage = 'og_default.png',
  twitterImage = 'twitter_preview_default.png',
}: SEOTagsType) {
  const { t } = useTranslation()

  const OGImages = {
    [INTERNAL_LINKS.borrow]: {
      ogImage: 'og_borrow.png',
      twitterImage: 'twitter_preview_borrow.png',
    },
    [INTERNAL_LINKS.multiply]: {
      ogImage: 'og_multiply.png',
      twitterImage: 'twitter_preview_multiply.png',
    },
    [INTERNAL_LINKS.earn]: {
      ogImage: 'og_earn.png',
      twitterImage: 'twitter_preview_earn.png',
    },
  }[url] || {
    ogImage,
    twitterImage,
  }

  // TODO: Add Icon to the title
  const tabTitle = `${titleParams ? t(title, titleParams) : t(title)}`

  return (
    <Head>
      <title>{tabTitle}</title>
      <meta property="og:title" content={t(title)!} />
      <meta property="twitter:title" content={t(title)!} />

      <meta name="description" content={t(description)!} />
      <meta property="og:description" content={t(description)!} />
      <meta property="twitter:description" content={t(description)!} />

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

      <meta
        property="og:image"
        content={staticFilesRuntimeUrl(
          `/static/img/og_images/${OGImages.ogImage}?${getRandomString()}`,
        )}
      />
      <meta
        property="og:image:secure_url"
        content={staticFilesRuntimeUrl(
          `/static/img/og_images/${OGImages.ogImage}?${getRandomString()}`,
        )}
      />
      <meta
        name="twitter:image"
        content={staticFilesRuntimeUrl(
          `/static/img/og_images/${OGImages.twitterImage}?${getRandomString()}`,
        )}
      />
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

const APP_NAME = 'Summer.fi'

export function PWATags() {
  return (
    <>
      <meta name="application-name" content={APP_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={APP_NAME} />

      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#FFFFFF" />

      <link rel="manifest" href="/manifest.json" />

      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={staticFilesRuntimeUrl('/static/icons/apple-touch-icon.png')}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={staticFilesRuntimeUrl('/static/icons/favicon-32x32.png')}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={staticFilesRuntimeUrl('/static/icons/favicon-16x16.png')}
      />
    </>
  )
}
