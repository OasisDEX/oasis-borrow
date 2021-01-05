import { getGuideMainContent, getGuidesSlugs } from 'components/guides/guides'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { WithQuery } from 'helpers/types'
import { useTranslation } from 'i18n'
import PageNotFound from 'pages/404'
import React from 'react'
import { Box } from 'theme-ui'

interface GuidePageProps extends WithQuery {
  slugs: string[]
}

// eslint-disable-next-line import/no-default-export
export default function GuidePage({ query, slugs }: GuidePageProps) {
  const {
    i18n: { language },
  } = useTranslation()

  const guideContent =
    query?.slug && slugs.includes(`${query.slug}`) ? getGuideMainContent(`${query.slug}`) : null

  if (!guideContent) {
    return <PageNotFound />
  }

  const GuideContent = guideContent[language]

  return (
    <Box>
      {/* Temporary back link until it will be present in designs */}
      <AppLink href="/guides">Back</AppLink>
      <GuideContent />
    </Box>
  )
}

// Can be refactored to getStaticPaths and getStaticProps to render those at build time however right now `publicRuntimeConfig`
// setting in next.config.js and handling env vars is preventing that as it can't be used with getStaticPaths.
// Connected issue - https://github.com/vercel/next.js/discussions/11493
export async function getServerSideProps({ query }: WithQuery) {
  const slugs = getGuidesSlugs()

  return {
    props: {
      slugs,
      query,
    },
  }
}

GuidePage.layout = MarketingLayout
GuidePage.theme = 'Landing'
