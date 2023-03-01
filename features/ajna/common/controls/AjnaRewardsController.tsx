import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { ProductCardsWrapper } from 'components/productCards/ProductCardsWrapper'
import { AjnaHaveSomeQuestions } from 'features/ajna/common/components/AjnaHaveSomeQuestions'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { AjnaRewardCard } from 'features/ajna/common/components/AjnaRewardCard'
import { useTranslation } from 'next-i18next'
import React from 'react'

const rewardCards = [
  {
    title: 'ajna.rewards.cards.mining.title',
    image: '/static/img/ajna-eye-purple.svg',
    list: ['ajna.rewards.cards.mining.list-1', 'ajna.rewards.cards.mining.list-2'],
    link: { title: 'ajna.rewards.cards.mining.link', href: '/' },
    banner: {
      title: 'ajna.rewards.cards.mining.banner.title',
      value: '42.00',
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
      value: '42.00',
      subValue: '$80.20',
      button: {
        title: 'ajna.rewards.cards.button',
      },
    },
    gradient: 'linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)',
  },
]

export function AjnaRewardsController() {
  const { t } = useTranslation()

  return (
    <AnimatedWrapper>
      <AjnaHeader title={t('ajna.rewards.title')} intro={t('ajna.rewards.intro')} />
      <ProductCardsWrapper gap={24} desktopWidthOfCard={448} sx={{ mt: 5 }}>
        {rewardCards.map((rewardCard, idx) => (
          <AjnaRewardCard key={idx} {...rewardCard} />
        ))}
      </ProductCardsWrapper>
      <AjnaHaveSomeQuestions />
    </AnimatedWrapper>
  )
}
