import { Icon } from '@makerdao/dai-ui-icons'
import { Career, getCareerByFileName, getCareerFileNames } from 'features/careers/careers'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { groupBy } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button, Flex, Grid, Heading, Link, SxStyleProp, Text } from 'theme-ui'

import { PageSEOTags } from '../../components/HeadTags'
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export default function CareersPage({ careers }: { careers: Career[] }) {
  const { t } = useTranslation()
  const careersByArea = groupBy(careers, 'area')

  return (
    <Box sx={{ width: '100%', pb: 6, mt: 5 }}>
      <Heading
        variant="header1s"
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
                {careers.map((career) => (
                  <AppLink
                    key={career.slug}
                    href={`/careers/${career.slug}`}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'background',
                      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2)',
                      borderRadius: 8,
                      p: 3,
                      color: 'primary',
                      transition: 'transform 0.2s ease-in-out 0s, box-shadow 0.2s ease-in-out 0s',
                      ':hover': {
                        boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 10px',
                        transform: 'scaleX(0.99)',
                        '.apply-btn': {
                          bg: '#EEE',
                        },
                      },
                    }}
                  >
                    <Text sx={{ fontWeight: '600', width: '35%' }}>{career.title}</Text>
                    <Box sx={{ pr: [0, '12.5%', '12.5%'] }}>
                      <Text>{career.location}</Text>
                    </Box>
                    <Button
                      className="apply-btn"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bg: '#F6F6F6',
                        color: 'link',
                        fontSize: 2,
                        fontWeight: '600',
                        transition: 'background-color 0.2s ease-in-out 0s',
                        py: 2,
                        whiteSpace: 'nowrap',
                      }}
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
            {t('careers.write-us')}{' '}
            <Link sx={{ color: 'link' }} href="mailto:work@oasis.app">
              work@oasis.app
            </Link>{' '}
            .
          </Text>
        </Box>
      ) : (
        <Box sx={{ mt: 5 }}>
          <Text variant="light">{t('careers.no-open-positions')}</Text>
          <br />
          <Text variant="light">
            {t('careers.write-us')}{' '}
            <Link sx={{ color: 'link' }} href="mailto:work@oasis.app">
              work@oasis.app
            </Link>{' '}
            .
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
        borderRadius: '13px',
        backgroundColor: 'primary',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...sx,
      }}
    >
      <Text sx={{ fontSize: 1, fontWeight: 600, color: '#FFF' }}>{count}</Text>
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

export const getStaticProps = async ({ locale }: { locale: string }) => {
  const careers = await Promise.all(getCareerFileNames().map((file) => getCareerByFileName(file)))

  return {
    props: {
      careers,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
