import { Icon } from '@makerdao/dai-ui-icons'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { Career, getCareerByFileName, getCareerFileNames, slugify } from 'features/careers/careers'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import dynamic from 'next/dynamic'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'

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
          color: 'text.focused',
        }}
      >
        <Icon name="arrow_left" size="16px" sx={{ mr: 1 }} />
        <Text variant="paragraph2" sx={{ color: 'text.focused', fontWeight: 600 }}>
          {t('careers.back-link')}
        </Text>
      </AppLink>
      <Text
        variant="header2"
        sx={{
          mt: 5,
          mb: 2,
        }}
      >
        {career.title}
      </Text>
      <Text sx={{ mb: 5, color: 'primary' }}>{career.location}</Text>
      <Box
        sx={{
          h2: {
            variant: 'text.header3',
            mb: 3,
            mt: 5,
          },
          'p, ul': { variant: 'text.light', my: 2 },
          ul: { pl: 4 },
          li: { mb: 3 },
          strong: {
            fontWeight: 400,
            color: 'primary',
            a: {
              fontWeight: 600,
            },
          },
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

export async function getStaticProps({ params, locale }: { params: any; locale: string }) {
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
