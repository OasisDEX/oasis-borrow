// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { currentContent } from 'components/content'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { capitalize } from 'helpers/capitalize'
import { useTranslation } from 'i18n'
import React from 'react'
import { Box, Button, Container, Flex, Grid, Image, Text } from 'theme-ui'

export default function Dai() {
  const {
    t,
    i18n: { language },
  } = useTranslation()

  const Content = currentContent.introduction.content[language || 'en']

  return (
    <Grid sx={{ alignContent: 'center' }}>
      <Container variant="layout.termsContainer">
        <AppLink href="/">
          <Flex sx={{ alignItems: 'center', color: 'primary', opacity: '50%' }}>
            <Icon name="chevron_left" size={11} mr={1} />
            <Text
              sx={{
                fontSize: 3,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('back')}
            </Text>
          </Flex>
        </AppLink>
        <Box>
          <Content />
        </Box>
      </Container>

      <Box
        sx={{
          width: ['100%', '100%', '100%', '818px'],
          bg: 'background',
          borderRadius: 'roundish',
        }}
        mt={4}
        px={5}
      >
        <Grid columns={[1, 1, 2]} gap={5} p={4} sx={{ justifyItems: 'center' }}>
          <Box>
            <Image
              src="static/img/oasis-getstarted.gif"
              sx={{
                display: 'block',
                position: 'relative',
                maxWidth: '100%',
                borderRadius: 'roundish',
                border: 'light',
              }}
            />
          </Box>
          <Grid
            sx={{ alignItems: 'center', textAlign: ['center', 'center', 'left'] }}
            gap={[4, 4, 3]}
            pb={[0, 0, 4]}
          >
            <Text variant="mediumHeading" m={0} p={0}>
              {t('introduction.title')}
            </Text>
            <Grid gap={[3, 3, 2]}>
              {[...Array(3)].map((_, i) => (
                <Text key={i} sx={{ textAlign: 'left' }}>
                  {t(`introduction.step-${i + 1}`)}
                </Text>
              ))}
            </Grid>
            <Box>
              <AppLink href="/dashboard">
                <Button sx={{ fontWeight: 'semiBold' }}>
                  {capitalize(t('get-started').toLowerCase())}
                </Button>
              </AppLink>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  )
}

Dai.layout = MarketingLayout
Dai.layoutProps = {
  variant: 'daiContainer',
}
Dai.theme = 'Landing'
Dai.seoTags = (
  <PageSEOTags title="seo.dai.title" description="seo.dai.description" ogImage="og-dai.png" />
)
