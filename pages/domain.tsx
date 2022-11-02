import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useScrollToTop } from 'helpers/useScrollToTop'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { Fragment } from 'react'
import { Box, Grid, Heading, Image, Text } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function DomainPage() {
  useScrollToTop()

  const securityCategories = [
    {
      name: 'username',
      header: 'Stand out from the crowd',
      description:
        'Stop being a random number that no one will ever remember, get your personalized name as NFT in .oasis domain and build your own identity.',
    },
    {
      name: 'transactions',
      header: 'Make transactions easier',
      description:
        'Send and receive transactions simply by providing users personal domain instead of addresses.',
    },
    {
      name: 'vaults',
      header: 'Get organized and recognizable',
      description:
        'Mint individual domains for your vaults for you and others to see that will stay with you forever.',
    },
  ]

  return (
    <Box sx={{ width: '100%', mt: [4, 5], pb: [4, 6] }}>
      <Heading variant="header2" sx={{ textAlign: 'center', mb: 2 }}>
        Oasis NFT domains
      </Heading>
      <Text variant="paragraph1" sx={{ color: 'neutral80', textAlign: 'center', mb: 90 }}>
        Mint your own personalized username in .oasis domain.
      </Text>
      <Grid
        sx={{
          gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(1, 100px calc(100% - 120px))'],
          columnGap: 4,
          rowGap: [2, 5],
        }}
      >
        {securityCategories.map((category) => (
          <Fragment key={`SecurityCategories_${category.name}`}>
            <Box sx={{ textAlign: ['center', 'left'] }}>
              <Image
                src={staticFilesRuntimeUrl(`/static/img/domain/${category.name}.svg`)}
                width={100}
                sx={{ width: '100px', height: '100px' }}
              />
            </Box>
            <Box sx={{ textAlign: ['center', 'left'], mb: [6, 2] }}>
              <Heading variant="header3" sx={{ color: 'primary100', mb: 1 }}>
                {category.header}
              </Heading>
              <Text variant="paragraph2" sx={{ color: 'neutral80', mb: 1 }}>
                {category.description}
              </Text>
            </Box>
          </Fragment>
        ))}
      </Grid>
    </Box>
  )
}

DomainPage.layout = MarketingLayout
DomainPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}
DomainPage.seoTags = (
  <PageSEOTags title="NFT Domain" description="Claim your NFT domain" url="/domain" />
)
DomainPage.theme = 'Landing'

export default DomainPage
