import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import React from 'react'
import { useThemeUI } from 'theme-ui'

export function HeadTags() {
  const { theme } = useThemeUI()
  // @ts-ignore
  const fontLinkHref = theme.metadata && theme.metadata.fontLinkHref

  return (
    <Head>
      {fontLinkHref && <link href={fontLinkHref} rel="stylesheet" />}
      <link rel="shortcut icon" href="/borrow/static/favicon.ico" />
    </Head>
  )
}

interface SEOTagsType {
  title: string
  description: string
  url?: string
  ogImage?: string
}

export function PageSEONoFollow() {
  return (
    <Head>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  )
}

const APP_URL = 'https://oasis.app'

export function PageSEOTags({ title, description, url = '/', ogImage = 'og.png' }: SEOTagsType) {
  const { t } = useTranslation()

  return (
    <Head>
      <title>{t(title)}</title>
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

      <meta property="og:url" content={`${APP_URL}${url}`} />
      <link rel="canonical" href={`${APP_URL}${url}`} />

      <meta property="og:image" content={`${APP_URL}/static/${ogImage}`} />
      <meta property="og:image:secure_url" content={`${APP_URL}/static/${ogImage}`} />
      <meta name="twitter:image" content={`${APP_URL}/static/${ogImage}`} />
      <meta name="twitter:card" content="summary_large_image" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Oasis.Borrow" />
    </Head>
  )
}

const APP_NAME = 'Oasis.Borrow'

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

      {/* Icons */}
      <link href="/borrow/static/icons/favicon-16.png" rel="icon" type="image/png" sizes="16x16" />
      <link href="/borrow/static/icons/favicon-32.png" rel="icon" type="image/png" sizes="32x32" />
      <link href="/borrow/static/icons/favicon-96.png" rel="icon" type="image/png" sizes="96x96" />

      {/* iOS */}
      <link href="/borrow/static/icons/apple-icon-76x76.png" rel="apple-touch-icon" sizes="76x76" />
      <link href="/borrow/static/icons/apple-icon-120x120.png" rel="apple-touch-icon" sizes="120x120" />
      <link href="/borrow/static/icons/apple-icon-152x152.png" rel="apple-touch-icon" sizes="152x152" />

      {/* Android */}
      <link href="/borrow/static/icons/android-icon-192x192.png" rel="icon" sizes="192x192" />
    </>
  )
}
