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

  return (
    <Box sx={{ width: '100%' }}>
      <AppLink href="/owner/wsc">owner</AppLink>
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
