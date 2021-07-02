import { Icon } from '@makerdao/dai-ui-icons'
import {
  Career,
  getCareerByFileName,
  getCareerFileNames,
  slugify,
} from 'features/careers/careers'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import dynamic from 'next/dynamic'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'
import {PageSEOTags} from "components/HeadTags";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export default function CareerPage({ career }: { career: Career }) {
  const { t } = useTranslation()
  const Markdown = dynamic(() => import(`features/careers/listings/${career.slug}.mdx`))

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <AppLink
        href="/careers"
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'link',
        }}
      >
        <Icon name="arrow_left" size="16px" sx={{ mr: 1 }} />
        <Text variant="microHeading" sx={{ color: 'link', fontWeight: 600 }}>
          {t('careers.back-link')}
        </Text>
      </AppLink>
      <Text
        variant="headingPolar"
        sx={{
          mt: 5,
          mb: 2,
        }}
      >
        {career.title}
      </Text>
      <Text sx={{ mb: 5 }}>{career.location}</Text>
      <Box
        sx={{
          h2: {
            variant: 'text.smallHeadingPolar',
            mb: 3,
            mt: 5,
          },
          'p, ul': { variant: 'text.light', my: 2 },
          ul: { pl: 4 },
          li: { mb: 3 },
          strong: { fontWeight: 400, color: 'text' },
          a: { fontWeight: 600, color: 'link' },
        }}
      >
        <Markdown />
      </Box>
    </Box>
  )
}

CareerPage.layout = MarketingLayout
CareerPage.seoTags = (
  <PageSEOTags title="seo.careers.title" description="seo.careers.description" url="/careers" />
)
CareerPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}

export async function getStaticProps({ params, locale }: {params: any, locale: string}) {
  const career = await getCareerByFileName(`${params.slug}.mdx`)

  return {
    props: {
      career,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export async function getStaticPaths() {
  const files = getCareerFileNames()

  return {
    paths: files.map((file: string) => {
      return {
        params: {
          slug: slugify(file),
        },
      }
    }),
    fallback: false,
  }
}
