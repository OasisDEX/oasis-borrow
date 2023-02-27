import { ProductCardsWrapper } from 'components/productCards/ProductCardsWrapper'
import { AjnaHaveSomeQuestions } from 'features/ajna/components/AjnaHaveSomeQuestions'
import { AjnaRewardCard } from 'features/ajna/components/AjnaRewardCard'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

const rewardCards = [
  {
    title: 'ajna.rewards.cards.mining.title',
    image: '/static/img/ajna-eye-purple.svg',
    list: ['ajna.rewards.cards.mining.list-1', 'ajna.rewards.cards.mining.list-2'],
    link: { title: 'ajna.rewards.cards.mining.link', href: '/' },
    banner: {
      title: 'ajna.rewards.cards.mining.banner.title',
      value: '42.00 AJNA',
      subValue: '$80.20',
      button: {
        title: 'ajna.rewards.cards.button',
      },
    },
    gradient: 'linear-gradient(90deg, #FFEFFD 0%, #F5EDFF 100%), #FFFFFF',
  },
  {
    title: 'ajna.rewards.cards.token.title',
    image: '/static/img/ajna-eye-orange.svg',
    list: ['ajna.rewards.cards.token.list-1', 'ajna.rewards.cards.token.list-2'],
    link: { title: 'ajna.rewards.cards.token.link', href: '/' },
    banner: {
      title: 'ajna.rewards.cards.token.banner.title',
      value: '42.00 AJNA',
      subValue: '$80.20',
      button: {
        title: 'ajna.rewards.cards.button',
      },
    },
    gradient: 'linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)',
  },
]

export function AjnaRewardsView() {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        flex: 1,
        ...slideInAnimation,
        position: 'relative',
        animationDuration: '0.4s',
        animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
      }}
    >
      <Flex
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Text as="p" variant="header2" sx={{ mt: [3, 3, 5], mb: 3, textAlign: 'center' }}>
          {t('ajna.rewards.page-title')}
        </Text>
        <Text
          as="p"
          variant="paragraph2"
          sx={{ mb: [5, '48px'], color: 'neutral80', maxWidth: '740px', textAlign: 'center' }}
        >
          {t('ajna.rewards.page-description')}
        </Text>
      </Flex>
      <ProductCardsWrapper desktopWidthOfCard={444}>
        {rewardCards.map((rewardCard, idx) => (
          <AjnaRewardCard key={idx} {...rewardCard} />
        ))}
      </ProductCardsWrapper>
      <AjnaHaveSomeQuestions />
    </Box>
  )
}
