import { getMarketingTemplatePageProps } from 'features/marketing-layouts/helpers'
import type { MarketingTemplateFreeform } from 'features/marketing-layouts/types'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

type MarketingTemplatePageProps = MarketingTemplateFreeform

function MarketingTemplatePage(props: MarketingTemplatePageProps) {
  console.log(props)
  // const {
  //   seoDescription,
  //   seoTitle,
  //   palette: { background },
  // } = props

  return (
    <>test</>
    // <MarketingLayout topBackground="none" backgroundGradient={background}>
    //   <PageSEOTags title={seoTitle} description={seoDescription} />
    //   <MarketingTemplateView {...props} />
    // </MarketingLayout>
  )
}

export default MarketingTemplatePage

export async function getServerSideProps({
  locale,
  query: { slug: rawSlug },
}: GetServerSidePropsContext) {
  if (!rawSlug) return { redirect: { permanent: false, destination: '/not-found' } }
  const [slug, preview] = Array.isArray(rawSlug) ? rawSlug : [rawSlug]

  try {
    const marketingTemplatePageProps = await getMarketingTemplatePageProps({
      slug,
      preview: preview === 'preview',
    })

    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        ...marketingTemplatePageProps,
      },
    }
  } catch (e) {
    console.error('Caught error on better-on-summer', e)
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
      },
    }
    // return { redirect: { permanent: false, destination: '/not-found' } }
  }
}
