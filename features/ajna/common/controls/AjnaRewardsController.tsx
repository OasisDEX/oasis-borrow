import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { FloatingLabel } from 'components/FloatingLabel'
import { ProductCardsWrapper } from 'components/productCards/ProductCardsWrapper'
import { WithArrow } from 'components/WithArrow'
import { AjnaHaveSomeQuestions } from 'features/ajna/common/components/AjnaHaveSomeQuestions'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { AjnaRewardCard } from 'features/ajna/common/components/AjnaRewardCard'
import { useAjnaRewards } from 'features/ajna/rewards/useAjnaRewards'
import { useConnection } from 'features/web3OnBoard'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Button, Flex } from 'theme-ui'

const oasisRewardsCard = {
  title: 'ajna.rewards.cards.token.title',
  image: '/static/img/ajna-eye-orange.svg',
  list: [
    'ajna.rewards.cards.token.list-1',
    'ajna.rewards.cards.token.list-2',
    'ajna.rewards.cards.token.list-3',
  ],
  // TODO update link once available
  link: { title: 'ajna.rewards.cards.token.link', href: EXTERNAL_LINKS.DOCS.AJNA.TOKEN_REWARDS },
  banner: {
    title: 'ajna.rewards.cards.token.banner.title',
    button: {
      title: 'ajna.rewards.cards.button',
    },
  },
  ownerPageLink: {
    title: 'ajna.rewards.cards.earning-across',
    href: '/owner',
  },
  gradient: 'linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)',
}

export function AjnaRewardsController() {
  const { t } = useTranslation()
  const userAjnaRewards = useAjnaRewards()

  const { isConnected } = useAccount()
  const { connect } = useConnection()

  const handleConnect = useCallback(() => {
    if (!isConnected) {
      connect()
    }
  }, [isConnected, connect])

  return (
    <AnimatedWrapper>
      <AjnaHeader title={t('ajna.rewards.title')} intro={t('ajna.rewards.intro')} />
      {!isConnected && (
        <Flex sx={{ justifyContent: 'center', mb: 5 }}>
          <Button sx={{ fontSize: 3, py: 2 }} onClick={handleConnect}>
            <WithArrow
              gap={1}
              sx={{ color: 'inherit', fontSize: 'inherit', p: 2, pl: '24px', pr: '36px' }}
            >
              {t('connect-wallet-button')}
            </WithArrow>
          </Button>
        </Flex>
      )}
      <ProductCardsWrapper desktopWidthOfCard={448} sx={{ mt: 5 }}>
        {[
          <AjnaRewardCard
            key="oasisRewards"
            isLoading={userAjnaRewards.isLoading}
            rewards={userAjnaRewards.rewards}
            {...oasisRewardsCard}
            floatingLabel={
              <FloatingLabel
                text={t('ajna.rewards.cards.token.floatingLabel')}
                flexSx={{
                  top: 4,
                  right: ['-17px', '-23px'],
                  background:
                    'radial-gradient(99% 180% at 11.74% 11.59%, #B67CFF 0%, #878BFC 61.65%, #526EFF 100%)',
                  boxShadow: 'unset',
                }}
                textSx={{
                  fontWeight: 'semiBold',
                }}
                imageUrl="/static/img/logos/dot_light.svg"
              />
            }
          />,
        ]}
      </ProductCardsWrapper>
      <AjnaHaveSomeQuestions />
    </AnimatedWrapper>
  )
}
