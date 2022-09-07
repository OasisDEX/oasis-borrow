import { keyframes } from '@emotion/core'
import { Icon } from '@makerdao/dai-ui-icons'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useScrollToTop } from 'helpers/useScrollToTop'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { Fragment } from 'react'
import { Box, Grid, Heading, Image, Text } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function SecurityPage() {
  useScrollToTop()
  const { t } = useTranslation()

  const securityTopics = [
    {
      name: 'people',
      header: 'Talented people',
      description:
        'A highly experienced and dedicated team of DeFi builders. We’ve built and launched some of the most popular DeFi protocols and products.',
      links: [{ url: '/about', label: 'Meet our Team' }],
    },
    {
      name: 'audit',
      header: 'Independently audited',
      description:
        'Our stringent security procedures didn’t occur by luck. It came about with a rigorous process of both internal and external audits.',
      links: [
        { url: '/report1', label: 'Multiply Audit Report' },
        { url: '/report2', label: 'B Feature Report Report' },
        { url: '/report3', label: 'Automation  Audit Report' },
        { url: '/report4', label: 'A Feature Report Report' },
      ],
    },
    {
      name: 'bug',
      header: 'Bug bounty',
      description:
        'Working with a community of code reviewers, ethical and white hat hackers we are giving rewards of up to $100k indentify any bugs.',
      links: [{ url: 'https://immunefi.com/bounty/oasis/', label: 'Go to Bug Bounty' }],
    },
    {
      name: 'shield',
      header: 'Privacy protection',
      description:
        "We don't collect any personal identifiable information and do not track or store IP addresses or locations.",
      links: [{ url: '/privacy', label: 'View Privacy Policy' }],
    },
  ]
  return (
    <Box sx={{ width: '100%', mt: 5, pb: 6 }}>
      <Heading variant="header2" sx={{ textAlign: 'center', mb: 2 }}>
        Why do users trust us?
      </Heading>
      <Text variant="paragraph1" sx={{ color: 'neutral80', textAlign: 'center', mb: 90 }}>
        Oasis.app is one of the oldest DeFi products with a rigorous approach to security. Users
        from all over the world trust us with billions of dollars of their funds.
      </Text>
      <Grid
        sx={{
          gridTemplateColumns: 'repeat(1, 100px calc(100% - 120px))',
          columnGap: 4,
          rowGap: 5,
        }}
      >
        {securityTopics.map((topic) => (
          <Fragment key={`SecurityTopics_${topic.name}`}>
            <Box>
              <Image
                src={staticFilesRuntimeUrl(`/static/img/security/${topic.name}.svg`)}
                width={100}
                sx={{ width: '100px', height: '100px' }}
              />
            </Box>
            <Box>
              <Heading variant="header3" sx={{ color: 'primary100', mb: 1 }}>
                {topic.header}
              </Heading>
              <Text variant="paragraph2" sx={{ color: 'neutral80', mb: 1 }}>
                {topic.description}
              </Text>
              {topic.links.length && (
                <Grid
                  sx={{
                    mt: 3,
                    gridTemplateColumns: 'repeat(2, calc(50% - 16px))',
                    columnGap: 4,
                    rowGap: 1,
                  }}
                >
                  {topic.links.map((link) => (
                    <AppLink variant="inText" target="_blank" href={link.url}>
                      {link.label}
                      <Icon
                        name="arrow_right"
                        size="14px"
                        sx={{
                          ml: 1,
                          position: 'relative',
                        }}
                      />
                    </AppLink>
                  ))}
                </Grid>
              )}
            </Box>
          </Fragment>
        ))}
      </Grid>
    </Box>
  )
}

SecurityPage.layout = MarketingLayout
SecurityPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}
SecurityPage.seoTags = (
  <PageSEOTags title="seo.security.title" description="seo.security.description" url="/security" />
)
SecurityPage.theme = 'Landing'

export default SecurityPage
