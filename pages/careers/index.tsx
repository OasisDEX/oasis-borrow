import { Icon } from '@makerdao/dai-ui-icons'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { Career, getCareerByFileName, getCareerFileNames } from 'features/careers/careers'
import { groupBy, orderBy } from 'lodash'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Button, Flex, Grid, Heading, Link, SxStyleProp, Text } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => {
  const careers = await Promise.all(getCareerFileNames().map((file) => getCareerByFileName(file)))
  const translations = await serverSideTranslations(locale, ['common'])

  return {
    props: {
      careers,
      ...translations,
    },
  }
}
function CareersPage({ careers }: { careers: Career[] }) {
  const { t } = useTranslation()
  const careersByArea = groupBy(careers, 'area')

  return (
    <Box sx={{ width: '100%', pb: 6, mt: 5 }}>
      <Heading
        variant="header1"
        sx={{
          textAlign: 'center',
          mb: 4,
        }}
      >
        {t('careers.heading')}
      </Heading>
      <Text variant="light">{t('careers.intro')}</Text>
      {!!careers.length && (
        <Box sx={{ mt: 6 }}>
          {Object.entries(careersByArea).map(([area, careers]) => (
            <Box key={area} sx={{ mt: 5 }}>
              <Flex sx={{ mb: 4, pl: 1 }}>
                <Heading variant="header2">{area}</Heading>
                <RoleCount
                  count={careers.length}
                  sx={{ ml: 2, position: 'relative', top: '12px' }}
                />
              </Flex>
              <Grid>
                {orderBy(careers, ['order']).map((career) => (
                  <AppLink
                    key={career.slug}
                    href={`/careers/${career.slug}`}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'neutral10',
                      boxShadow: 'table',
                      borderRadius: 8,
                      p: 3,
                      color: 'primary100',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: ['table', 'table_hovered'],
                        transform: ['none', 'scaleX(0.99)'],
                      },
                    }}
                  >
                    <Text variant="paragraph2" sx={{ fontWeight: '600', width: '35%' }}>
                      {career.title}
                    </Text>
                    <Box sx={{ pr: [0, '12.5%', '12.5%'] }}>
                      <Text variant="paragraph2">{career.location}</Text>
                    </Box>
                    <Button
                      sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}
                      variant="secondary"
                    >
                      {t('careers.cta-button')}{' '}
                      <Icon name="arrow_right" size="12px" sx={{ ml: 1 }} />
                    </Button>
                  </AppLink>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}
      {careers.length > 0 ? (
        <Box sx={{ mt: 6 }}>
          <Text variant="light">{t('careers.no-positions-you-like')}</Text>
          <br />
          <Text variant="light">
            {t('careers.write-us')} <Link href="mailto:work@oasis.app">work@oasis.app</Link>.
          </Text>
        </Box>
      ) : (
        <Box sx={{ mt: 5 }}>
          <Text variant="light">{t('careers.no-open-positions')}</Text>
          <br />
          <Text variant="light">
            {t('careers.write-us')} <Link href="mailto:work@oasis.app">work@oasis.app</Link>.
          </Text>
        </Box>
      )}
    </Box>
  )
}

function RoleCount({ count, sx }: { count: number; sx?: SxStyleProp }) {
  return (
    <Flex
      sx={{
        width: '26px',
        height: '26px',
        borderRadius: 'large',
        backgroundColor: 'primary100',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...sx,
      }}
    >
      <Text sx={{ fontSize: 1, fontWeight: 'semiBold', color: 'neutral10' }}>{count}</Text>
    </Flex>
  )
}

CareersPage.layout = MarketingLayout
CareersPage.seoTags = (
  <PageSEOTags title="seo.careers.title" description="seo.careers.description" url="/careers" />
)
CareersPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}

export default CareersPage
