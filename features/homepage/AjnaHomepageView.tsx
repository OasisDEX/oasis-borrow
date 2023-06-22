import { Icon } from '@makerdao/dai-ui-icons'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { useAppContext } from 'components/AppContextProvider'
import { BenefitCard, BenefitCardsWrapper } from 'components/BenefitCard'
import { LandingBanner } from 'components/LandingBanner'
import { AppLink } from 'components/Links'
import { AjnaHaveSomeQuestions } from 'features/ajna/common/components/AjnaHaveSomeQuestions'
import { Hero } from 'features/homepage/HomepageView'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useObservable } from 'helpers/observableHook'
import { LendingProtocol } from 'lendingProtocols'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

export const benefitCardsAnja = [
  {
    header: 'landing.benefits.ajna.card-header-1',
    image: {
      src: '/static/img/info_cards/benefit_1.png',
      bottom: '0',
    },
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
  },
  {
    header: 'landing.benefits.ajna.card-header-2',
    image: {
      src: '/static/img/info_cards/benefit_2.png',
      bottom: '30px',
      width: '382px',
      bgWidth: 'calc(100% - 64px)',
    },
    background: 'linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF',
  },
  {
    header: 'landing.benefits.ajna.card-header-3',
    image: {
      src: '/static/img/info_cards/benefit_3.png',
      bottom: '0',
    },
    background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
  },
]

export function AjnaHomepageView() {
  const { t } = useTranslation()
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)

  return (
    <AnimatedWrapper>
      <Box sx={{ maxWidth: '670px', mt: 5, mx: 'auto' }}>
        <Hero
          isConnected={context?.status === 'connected'}
          heading="landing.hero.ajna.headline"
          subheading={
            <Trans
              i18nKey="landing.hero.ajna.subheader"
              components={[
                <AppLink
                  sx={{ fontSize: 'inherit', fontWeight: 'regular' }}
                  href={EXTERNAL_LINKS.KB.AJNA}
                />,
              ]}
            />
          }
          showButton={false}
        />
      </Box>
      <Box sx={{ mt: '180px', borderTop: '1px solid', borderColor: 'neutral20' }}>
        <ProductHubView
          headerGradient={['#f154db', '#974eea']}
          initialProtocol={[LendingProtocol.Ajna]}
          product={ProductHubProductType.Borrow}
          promoCardsCollection="AjnaLP"
        />
      </Box>
      <Flex
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          mb: 7,
        }}
      >
        <Text as="p" variant="header3" sx={{ mt: [6, 6, 7], mb: 4, textAlign: 'center' }}>
          {t('landing.benefits.ajna.header')}
        </Text>
        <Text
          as="p"
          variant="paragraph1"
          sx={{ mb: [5, '48px'], color: 'neutral80', maxWidth: '740px', textAlign: 'center' }}
        >
          {t('landing.benefits.ajna.description')}
        </Text>
        <BenefitCardsWrapper>
          {benefitCardsAnja.map((card) => (
            <BenefitCard
              header={card.header}
              image={card.image}
              key={card.header}
              background={card.background}
            />
          ))}
        </BenefitCardsWrapper>
      </Flex>
      <LandingBanner
        title={t('ajna.landing-banner.title')}
        description={t('ajna.landing-banner.description')}
        background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)"
        image={{
          src: '/static/img/setup-banner/anja-landing-banner.png',
        }}
        link={{
          href: 'link',
          label: t('ajna.landing-banner.linkLabel'),
        }}
        button={
          context?.status !== 'connected' ? (
            <AppLink
              variant="primary"
              href="/connect"
              sx={{
                display: 'flex',
                px: '40px',
                py: 2,
                color: 'offWhite',
                alignItems: 'center',
                '&:hover svg': {
                  transform: 'translateX(10px)',
                },
              }}
            >
              {t('connect-wallet-button')}
              <Icon
                name="arrow_right"
                sx={{
                  ml: 2,
                  position: 'relative',
                  left: 2,
                  transition: '0.2s',
                }}
              />
            </AppLink>
          ) : null
        }
      />
      <AjnaHaveSomeQuestions />
    </AnimatedWrapper>
  )
}
