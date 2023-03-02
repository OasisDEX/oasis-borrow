import { InfoCard } from 'components/InfoCard'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

export function AjnaHaveSomeQuestions() {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        mb: [3, 3, 6],
      }}
    >
      <Text as="p" variant="header3" sx={{ textAlign: 'center', mt: [6, 6, '205px'], mb: 4 }}>
        {t('landing.info-cards.have-some-questions')}
      </Text>
      <Grid
        gap={4}
        sx={{
          maxWidth: '854px',
          margin: 'auto',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
        }}
      >
        <InfoCard
          title={t('landing.info-cards.learn.learn')}
          subtitle={t('landing.info-cards.learn.deep-dive')}
          links={[
            {
              href: 'https://www.ajna.finance/',
              text: t('ajna.learn.ajna-website'),
            },
            {
              href: 'https://kb.oasis.app/help/tutorials',
              text: t('landing.info-cards.learn.tutorials'),
            },
            {
              href: 'https://kb.oasis.app/help/borrow',
              text: t('landing.info-cards.learn.key-concepts'),
            },
          ]}
          backgroundGradient="linear-gradient(127.5deg, #EEE1F9 0%, #FFECE8 56.77%, #DDFFF7 100%)"
          backgroundImage="/static/img/info_cards/cubes_nov27.png"
        />
        <InfoCard
          title={t('landing.info-cards.support.support')}
          subtitle={t('landing.info-cards.support.contact-whenever')}
          links={[
            {
              href: 'https://kb.oasis.app/help/frequently-asked-questions',
              text: t('ajna.learn.anja-faq'),
            },
            {
              href: 'https://discord.com/invite/pQu52Dtw7r',
              text: t('ajna.learn.ajna-discord'),
            },
            {
              href: 'https://twitter.com/ajnafi',
              text: t('ajna.learn.ajna-twitter'),
            },
            {
              href: 'https://discord.gg/oasisapp',
              text: t('ajna.learn.oasis-discord'),
            },
            {
              href: 'https://twitter.com/oasisdotapp',
              text: t('ajna.learn.oasis-twitter'),
            },
          ]}
          backgroundGradient="linear-gradient(135.35deg, #FEF7FF 0.6%, #FEE9EF 100%), radial-gradient(261.45% 254.85% at 3.41% 2.19%, #FFFADD 0%, #FFFBE3 0.01%, #F0FFF2 52.6%, #FBEDFD 100%)"
          backgroundImage="/static/img/info_cards/bubbles.png"
        />
      </Grid>
    </Box>
  )
}
