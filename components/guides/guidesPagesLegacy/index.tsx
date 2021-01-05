import { getAllGuidesMetadata, GuideMetadata } from 'components/guides/guides'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { useTranslation } from 'i18n'
import React from 'react'
import { Badge, Box, Card, Grid, Heading, Text } from 'theme-ui'

import { SectionDescription } from '../../../pages'

function CardGuide({
  meta: { title, slug, summary, featuredImage, readTime },
}: {
  meta: GuideMetadata
}) {
  const { t } = useTranslation()

  return (
    <AppLink href="/guides/[slug]" as={`/guides/${slug}`}>
      <Card p={0} sx={{ boxShadow: 'cardGuide', border: 'none', overflow: 'hidden' }}>
        <Box
          sx={{
            fontSize: 0,
            position: 'relative',
            paddingBottom: '53.75%',
            '&:after': {
              position: 'absolute',
              display: 'block',
              content: '""',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `url(${featuredImage}) center/cover no-repeat`,
            },
          }}
        />
        <Grid p={3} gap={3}>
          <Heading variant="microHeading">{t(title)}</Heading>
          <Text sx={{ color: 'onBackground', fontSize: 2, mt: -2 }}>{t(summary)}</Text>
          <Box>
            <Badge variant="primary" sx={{ color: 'onSurface', py: 1, lineHeight: 'loose' }}>
              {t(readTime)}
            </Badge>
          </Box>
        </Grid>
      </Card>
    </AppLink>
  )
}

// eslint-disable-next-line import/no-default-export
export default function GuidesPage({ guides }: { guides: GuideMetadata[] }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ width: '100%' }}>
      {/* Temporary back link */}
      <AppLink href="/">Back</AppLink>
      <Grid gap="47px" columns={[1, 2]} sx={{ maxWidth: ['266px', '100%'], mx: 'auto', mb: 6 }}>
        {guides.map((meta) => (
          <CardGuide {...{ meta }} key={meta.slug} />
        ))}
      </Grid>
      <Grid columns="1fr" gap={5} sx={{ mx: 'auto', pt: 3 }}>
        {[...Array(3).keys()].map((i) => (
          <SectionDescription
            key={i}
            heading={t(`guides.sections.${i + 1}.title`)}
            text={t(`guides.sections.${i + 1}.description`)}
          />
        ))}
      </Grid>
    </Box>
  )
}

export async function getStaticProps() {
  const guides = getAllGuidesMetadata()

  return {
    props: {
      guides,
    },
  }
}

GuidesPage.layout = MarketingLayout
GuidesPage.theme = 'Landing'
