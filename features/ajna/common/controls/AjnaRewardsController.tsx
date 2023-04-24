import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { FloatingLabel } from 'components/FloatingLabel'
import { ProductCardsWrapper } from 'components/productCards/ProductCardsWrapper'
import { WithArrow } from 'components/WithArrow'
import { AjnaHaveSomeQuestions } from 'features/ajna/common/components/AjnaHaveSomeQuestions'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { AjnaRewardCard } from 'features/ajna/common/components/AjnaRewardCard'
import { useAjnaUserNfts } from 'features/ajna/rewards/useAjnaUserNfts'
import { useWeb3OnBoardConnection } from 'features/web3OnBoard'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Button, Flex } from 'theme-ui'

const miningRewardsCard = {
  title: 'ajna.rewards.cards.mining.title',
  image: '/static/img/ajna-eye-purple.svg',
  list: ['ajna.rewards.cards.mining.list-1', 'ajna.rewards.cards.mining.list-2'],
  // TODO update link once available
  link: { title: 'ajna.rewards.cards.mining.link', href: '/' },
  banner: {
    title: 'ajna.rewards.cards.mining.banner.title',
    button: {
      title: 'ajna.rewards.cards.button',
    },
  },
  ownerPageLink: {
    title: 'ajna.rewards.cards.earning-across',
    href: '/owner',
  },
  gradient: 'linear-gradient(90deg, #FFEFFD 0%, #F5EDFF 100%), #FFFFFF',
}

const oasisRewardsCard = {
  title: 'ajna.rewards.cards.token.title',
  image: '/static/img/ajna-eye-orange.svg',
  list: ['ajna.rewards.cards.token.list-1', 'ajna.rewards.cards.token.list-2'],
  // TODO update link once available
  link: { title: 'ajna.rewards.cards.token.link', href: '/' },
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
  const userNftsData = useAjnaUserNfts()

  const { isConnected } = useAccount()

  const { executeConnection } = useWeb3OnBoardConnection({ walletConnect: true })

  const handleConnect = useCallback(async () => {
    if (!isConnected) {
      await executeConnection()
    }
  }, [isConnected, executeConnection])

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
      <ProductCardsWrapper gap={24} desktopWidthOfCard={448} sx={{ mt: 5 }}>
        <AjnaRewardCard
          {...miningRewardsCard}
          onBtnClick={userNftsData.handler}
          txStatus={userNftsData.txDetails?.txStatus}
          rewards={userNftsData.rewards}
          isLoading={userNftsData.isLoading}
          key="miningRewards"
        />
        <AjnaRewardCard
          {...oasisRewardsCard}
          key="oasisRewards"
          notAvailable
          isLoading={false}
          rewards={{ tokens: zero, usd: zero, numberOfPositions: 0 }}
          floatingLabel={
            <FloatingLabel
              text={t('ajna.rewards.cards.mining.floatingLabel')}
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
              imageUrl="/static/img/logo_monolithic.svg"
            />
          }
        />
      </ProductCardsWrapper>
      <AjnaHaveSomeQuestions />
    </AnimatedWrapper>
  )
}
