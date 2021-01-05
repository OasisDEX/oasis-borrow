// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { MarketingLayout } from 'components/Layouts'
import { AppLink, EXTERNAL_LINKS } from 'components/Links'
import { useTranslation } from 'i18n'
import React, { ReactNode } from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Button, Card, Flex, Grid, Heading, Image, Text } from 'theme-ui'

interface CardLandingProps {
  icon: ReactNode
  cardType: string
  href: string
  as?: string
}

function CardLanding({ icon, cardType, href, as }: CardLandingProps) {
  const { t } = useTranslation()
  const cardTypeLowerCase = cardType.toLowerCase()

  return (
    <AppLink
      href={href}
      as={as}
      sx={{
        display: 'flex',
        cursor: 'pointer',
      }}
    >
      <Card
        p={3}
        sx={{
          width: '100%',
          bg: `surface`,
          boxShadow: 'cardLanding',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'mutedAlt',
          '&:hover': {
            color: 'primary',
            borderColor: 'primary',
          },
        }}
      >
        <Flex py={[1, null, 2]} pl={[0, null, 2]}>
          <Flex sx={{ alignItems: 'center', mr: 3 }}>{icon}</Flex>
          <Box sx={{ fontSize: 3, color: 'primary', flex: 1 }}>
            <Text sx={{ fontWeight: 'heading' }}>
              {t(`landing.cards.${cardTypeLowerCase}.title`)}
            </Text>
            <Text>{t(`landing.cards.${cardTypeLowerCase}.description`)}</Text>
          </Box>
        </Flex>
        <Box pr={1} pl={2}>
          <Icon name="landing_chevron_right" sx={{ transition: TRANSITIONS.global }} />
        </Box>
      </Card>
    </AppLink>
  )
}

export function SectionDescription({ heading, text }: { heading: string; text: string }) {
  return (
    <Box sx={{ mb: 3, fontSize: 4, maxWidth: '20em' }}>
      <Heading variant="smallHeading" as="h2" sx={{ mb: 3 }}>
        {heading}
      </Heading>
      <Text>{text}</Text>
    </Box>
  )
}

export function LandingPageView({ notification }: { notification?: ReactNode }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ width: '100%' }}>
      <Flex
        sx={{
          alignItems: notification ? 'flex-start' : 'center',
          maxWidth: '830px',
          mx: 'auto',
          justifyContent: 'space-between',
          flexDirection: ['column', 'column', 'row'],
        }}
      >
        <Grid
          columns="1fr"
          sx={{ maxWidth: '516px', pb: [5, 4], gap: (theme) => theme.sizingsCustom.gapHeadline }}
        >
          {notification}
          <Icon
            name="dai_circle_color"
            size="auto"
            height="46px"
            width="46px"
            sx={{
              position: 'relative',
              transform: 'translateX(-8%)',
            }}
          />
          <Heading variant="largeHeading" as="h1" sx={{ lineHeight: 'headline' }}>
            {t('landing.hero.headline')}
          </Heading>
          <Flex sx={{ width: '100%', alignItems: 'center' }}>
            <AppLink href="/dashboard">
              <Button sx={{ minWidth: '120px', mr: 3, lineHeight: 'body' }}>
                {t('landing.hero.button1')}
              </Button>
            </AppLink>
            <AppLink href="/dai">
              <Flex
                sx={{
                  color: 'primary',
                  alignItems: 'center',
                  transition: TRANSITIONS.global,
                  '&:hover': {
                    color: 'primaryEmphasis',
                  },
                }}
              >
                <Text sx={{ ml: 2, fontWeight: 'semiBold', mr: 2 }}>
                  {t('landing.hero.button2')}
                </Text>
                <Icon
                  name="landing_chevron_right"
                  size="auto"
                  width="7px"
                  height="11px"
                  sx={{ position: 'relative', top: '1px' }}
                />
              </Flex>
            </AppLink>
          </Flex>
        </Grid>
        <Image
          src="static/img/landing_phone.svg"
          sx={{
            display: 'block',
            position: 'relative',
            maxWidth: '100%',
          }}
        />
      </Flex>
      <Box
        sx={{
          bg: 'background',
          borderRadius: 'roundish',
          py: [5, 6],
          pb: [4, 4, 5],
          px: 3,
          mt: -5,
        }}
      >
        <Grid columns={[1, 2]} gap={4} sx={{ maxWidth: '802px', mx: 'auto', pt: 3 }}>
          {[...Array(4).keys()].map((i) => (
            <SectionDescription
              key={i}
              heading={t(`landing.sections.${i + 1}.title`)}
              text={t(`landing.sections.${i + 1}.description`)}
            />
          ))}
        </Grid>
        <Grid
          columns={[1, 2, 2]}
          gap={[3, null, 4]}
          sx={{
            maxWidth: ['400px', '845px'],
            mx: 'auto',
            justifyContent: 'space-between',
            mt: 4,
            pt: 1,
            gridAutoRows: '1fr',
          }}
        >
          <CardLanding
            {...{
              cardType: 'Borrow',
              href: EXTERNAL_LINKS.borrow,
              icon: <Icon name="maker_circle_color" size="38px" />,
            }}
          />
          <CardLanding
            {...{
              cardType: 'Introduction',
              href: '/dai',
              icon: <Image src="/static/img/logo.png" sx={{ width: '38px', height: '38px' }} />,
            }}
          />
        </Grid>
      </Box>
    </Box>
  )
}

export default function LandingPage() {
  return <LandingPageView />
}

LandingPage.layout = MarketingLayout
LandingPage.layoutProps = {
  variant: 'landingContainer',
}
LandingPage.theme = 'Landing'
