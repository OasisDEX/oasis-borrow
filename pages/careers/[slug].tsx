import { Icon } from '@makerdao/dai-ui-icons'
import {
  Career,
  getCareerByFileName,
  getCareerFileNames,
  slugify,
} from 'components/careers/careers'
import { BorrowMarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import dynamic from 'next/dynamic'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'

export default function CareerPage({ career }: { career: Career }) {
  const { t } = useTranslation()
  const Markdown = dynamic(() => import(`components/careers/listings/${career.slug}.mdx`))

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

CareerPage.layout = BorrowMarketingLayout
CareerPage.theme = 'Landing'

export async function getStaticProps({ params }: any) {
  const career = await getCareerByFileName(`${params.slug}.mdx`)

  return {
    props: {
      career,
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
