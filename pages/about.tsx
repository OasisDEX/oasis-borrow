import { Icon } from '@makerdao/dai-ui-icons'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { getTeamPicsFileNames, parseMemberInfo, TeamMember } from 'features/about/about'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { sortBy } from 'lodash'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Grid, Heading, Image, Text } from 'theme-ui'

function AboutPage({ members }: { members: TeamMember[] }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      <Box sx={{ mt: 5, pb: 5 }}>
        <Heading
          variant="header1"
          sx={{
            textAlign: 'center',
            mb: 4,
          }}
        >
          {t('about.heading')}
        </Heading>
        <Text variant="light">{t('about.description')}</Text>
      </Box>
      <AppLink
        href="/careers"
        sx={{ color: 'primary100', display: 'flex', alignItems: 'center', mt: 3 }}
      >
        <Text variant="paragraph1" sx={{ color: 'primary100', fontWeight: 'semiBold' }}>
          {t('about.careers-link')}
        </Text>
        <Icon name="arrow_right" size="16px" sx={{ ml: 1 }} />
      </AppLink>
      <Box sx={{ mt: 4 }}>
        <Heading variant="header2">{t('about.pics-title')}</Heading>
        <PortraitsGrid members={members} />
      </Box>
    </Box>
  )
}

AboutPage.layout = MarketingLayout
AboutPage.seoTags = (
  <PageSEOTags title="seo.about.title" description="seo.about.description" url="/about" />
)
AboutPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}

export default AboutPage

function PortraitsGrid({ members }: { members: TeamMember[] }) {
  const PORTRAIT_SIZE = '169px'

  return (
    <Grid
      sx={{
        paddingTop: 4,
        gridTemplateColumns: `repeat( auto-fit, ${PORTRAIT_SIZE} )`,
        columnGap: 4,
        rowGap: 5,
      }}
    >
      {members.map((member) => (
        <Box key={member.name}>
          <Box
            sx={{
              width: PORTRAIT_SIZE,
              height: PORTRAIT_SIZE,
              borderRadius: 'large',
              overflow: 'hidden',
            }}
          >
            <Image
              src={staticFilesRuntimeUrl(`/static/img/team/${member.picFileName}`)}
              sx={{ width: PORTRAIT_SIZE }}
            />
          </Box>
          <Box sx={{ pt: 3 }}>
            <Text sx={{ color: 'primary100', mb: 1 }}>{member.name}</Text>
            <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
              {member.title}
            </Text>
          </Box>
        </Box>
      ))}
    </Grid>
  )
}

export async function getStaticProps({ locale }: { locale: string }) {
  const members = getTeamPicsFileNames().map(parseMemberInfo)

  return {
    props: {
      members: sortBy(members, 'order'),
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
