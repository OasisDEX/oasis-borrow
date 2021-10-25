import { AppLinkWithArrow } from 'components/Links'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { GRADIENTS } from 'theme'
import { Box, Card, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'

const GET_STARTED_BIG_CARD_ITEMS = {
  multiply: {
    backgroundGradient: GRADIENTS.getStartedMultiply,
    cardMinHeight: ['343px', '420px'],
    imageStyles: {
      right: ['-35px', '0'],
      bottom: ['-23px', '13px'],
    },
    link: '/vaults/list',
  },
}

const GET_STARTED_SMALL_CARD_ITEMS = {
  borrow: {
    backgroundGradient: GRADIENTS.getStartedBorrow,
    cardMinHeight: ['343px', '202px'],
    imageStyles: {
      right: 0,
      bottom: '27px',
    },
    textStyles: {
      pr: ['32px', '140px'],
    },
    link: '/vaults/list',
  },
  manage: {
    backgroundGradient: GRADIENTS.getStartedManage,
    cardMinHeight: ['343px', '202px'],
    imageStyles: {
      right: 0,
      bottom: '13px',
    },
    textStyles: {
      pr: ['32px', '140px'],
    },
    link: '/connect',
  },
}

interface GetStartedProps {
  backgroundGradient: string
  cardMinHeight: string[]
  link: string
  cardKey: string
  imageStyles?: SxStyleProp
  textStyles?: SxStyleProp
}

export function GetStartedCard({
  backgroundGradient,
  cardMinHeight,
  imageStyles,
  textStyles,
  cardKey,
  link,
}: GetStartedProps) {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        p: 4,
        borderRadius: 'large',
        border: 'none',
        background: backgroundGradient,
        position: 'relative',
        minHeight: cardMinHeight,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          ...textStyles,
        }}
      >
        <Heading sx={{ my: 2, fontWeight: 'bold' }}>
          {t(`landing.get-started.${cardKey}.title`)}
        </Heading>
        <Text sx={{ position: 'relative', zIndex: 2, color: 'text.subtitle', mb: 3 }}>
          {t(`landing.get-started.${cardKey}.subtitle`)}
        </Text>
        <AppLinkWithArrow key={link} href={link} sx={{ position: 'relative', zIndex: 1 }}>
          {t(`landing.get-started.${cardKey}.link`)}
        </AppLinkWithArrow>
      </Box>
      <Image
        sx={{
          position: 'absolute',
          ...imageStyles,
        }}
        src={`/static/img/get_started_${cardKey}.png`}
      />
    </Card>
  )
}

export function GetStartedSection() {
  const { t } = useTranslation()

  return (
    <Box my={[4,0]}>
      <Heading as="h2" variant="header2" sx={{ textAlign: 'center', mb: 4 }}>
        {t('landing.get-started.title')}
      </Heading>
      <Grid
        columns={[1, '379px 1fr']}
        gap={[3, 4]}
        sx={{ pt: 3, maxWidth: ['343px', '943px'], mx: 'auto' }}
      >
        <Grid>
          {Object.entries(GET_STARTED_BIG_CARD_ITEMS).map(([key, value]) => (
            <GetStartedCard key={key} cardKey={key} {...value} />
          ))}
        </Grid>
        <Grid>
          {Object.entries(GET_STARTED_SMALL_CARD_ITEMS).map(([key, value]) => (
            <GetStartedCard key={key} cardKey={key} {...value} />
          ))}
        </Grid>
      </Grid>
    </Box>
  )
}
