import { AppLinkWithArrow, ROUTES } from 'components/Links'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid, Heading, Text } from 'theme-ui'

const HAVE_SOME_QUESTIONS_ITEMS = [
  {
    translationKey: 'learn',
    backgroundImage: 'learn',
    backgroundGradient:
      'radial-gradient(209.93% 294.65% at 2.92% 94.16%, #FFDDF1 0%, #EEF0FF 47.4%, #DDFFF7 100%)',
    gradient: '',
    links: [
      {
        href: 'https://kb.oasis.app/help/getting-started',
        labelKey: 'get-started',
      },
      {
        href: 'https://kb.oasis.app/help/tutorials',
        labelKey: 'tutorials',
      },
      {
        href: 'https://kb.oasis.app/help/borrow',
        labelKey: 'key-concepts',
      },
    ],
  },
  {
    translationKey: 'support',
    backgroundImage: 'support',
    backgroundGradient:
      'radial-gradient(199.72% 231.11% at 11.11% 22.22%, #FFFADD 0%, #E9FFEB 23.96%, #FADDFF 100%)',
    links: [
      {
        href: ROUTES.SUPPORT,
        labelKey: 'faq',
      },
      {
        href: ROUTES.DISCORD,
        labelKey: 'discord',
      },
      {
        href: ROUTES.CONTACT,
        labelKey: 'contact-us',
      },
      {
        href: ROUTES.TWITTER,
        labelKey: 'twitter',
      },
    ],
  },
]

function HaveSomeQuestionCard({
  translationKey,
  links,
  backgroundImage,
  backgroundGradient,
}: typeof HAVE_SOME_QUESTIONS_ITEMS[number]) {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        p: 4,
        borderRadius: 'large',
        border: 'none',
        background: backgroundGradient,
        position: 'relative',
        minHeight: '411px',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 1,
          background: `url(/static/img/have_some_questions_${backgroundImage}.png)`,
          backgroundPositionY: 'bottom',
          backgroundPositionX: ['-10px', 'right'],
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Heading sx={{ my: 2, fontWeight: 'bold' }}>
          {t(`landing.have-some-questions.${translationKey}.title`)}
        </Heading>
        <Text sx={{ mb: 4, color: 'text.subtitle', minHeight: '3em' }}>
          {t(`landing.have-some-questions.${translationKey}.subtitle`)}
        </Text>
        <Grid sx={{ color: 'primary', fontSize: 3, mb: 5 }}>
          {links.map(({ href, labelKey }) => (
            <AppLinkWithArrow key={href} href={href}>
              {t(`landing.have-some-questions.${translationKey}.links.${labelKey}`)}
            </AppLinkWithArrow>
          ))}
        </Grid>
      </Box>
    </Card>
  )
}

export function HaveSomeQuestionsSection() {
  const { t } = useTranslation()

  return (
    <Box my={[5, 7]}>
      <Heading as="h2" variant="header2" sx={{ mb: 4, textAlign: 'center' }}>
        {t('landing.have-some-questions.title')}
      </Heading>
      <Grid columns={[1, 2]} gap={[3, 4]} sx={{ pt: 3, maxWidth: ['343px', '854px'], mx: 'auto' }}>
        {HAVE_SOME_QUESTIONS_ITEMS.map((item, i) => (
          <HaveSomeQuestionCard {...item} key={i} />
        ))}
      </Grid>
    </Box>
  )
}
