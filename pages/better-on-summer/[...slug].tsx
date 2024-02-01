import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { getLandingPageBySlug } from 'contentful/queries'
import type { MarketingTemplateFreeform } from 'features/marketing-layouts/types'
import { MarketingTemplateView } from 'features/marketing-layouts/views'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

type MarketingTemplatePageProps = MarketingTemplateFreeform

function MarketingTemplatePage(props: MarketingTemplatePageProps) {
  const {
    seoDescription,
    seoTitle,
    palette: { background },
  } = props

  return (
    <MarketingLayout topBackground="none" backgroundGradient={background}>
      <PageSEOTags title={seoTitle} description={seoDescription} />
      <MarketingTemplateView {...props} />
    </MarketingLayout>
  )
}

export default MarketingTemplatePage

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const slug = params?.slug

  if (!slug) {
    return {
      redirect: {
        permanent: false,
        destination: '/not-found',
      },
    }
  }

  const resolvedSlug = Array.isArray(slug) ? slug.join('/') : slug

  try {
    const { seoTitle, seoDescription, palette, hero, blocks } = await getLandingPageBySlug(
      resolvedSlug,
    )

    const marketingTemplatePageProps: MarketingTemplateFreeform = {
      blocks,
      hero,
      palette,
      seoDescription,
      seoTitle,
    }

    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        ...marketingTemplatePageProps,
      },
    }
  } catch (e) {
    console.error('Caught error on better-on-summer', e)
    return {
      redirect: {
        permanent: false,
        destination: '/not-found',
      },
    }
  }
}
