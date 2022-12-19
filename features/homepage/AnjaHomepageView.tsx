import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AssetPill } from 'components/AssetPill'
import { BenefitCard, BenefitCardsWrapper } from 'components/BenefitCard'
import { HomepageTabLayout } from 'components/HomepageTabLayout'
import { InfoCard } from 'components/InfoCard'
import { LandingBanner } from 'components/LandingBanner'
import { AppLink } from 'components/Links'
import {
  AlternateProductCard,
  productCardsAjna,
} from 'components/productCards/AlternateProductCard'
import { ProductCardsWrapper } from 'components/productCards/ProductCardsWrapper'
import { TabBar } from 'components/TabBar'
import { otherAssets } from 'features/ajna/controls/AjnaNavigationController'
import { Hero } from 'features/homepage/HomepageView'
import { useObservable } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

const benefitCardsAnja = [
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
      width: '350px',
      bgWidth: '293px',
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

export function AnjaHomepageView() {
  const { t } = useTranslation()
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)

  return (
    <Box
      sx={{
        flex: 1,
      }}
    >
      <Hero
        isConnected={context?.status === 'connected'}
        sx={{
          mt: '117px ',
        }}
        heading="landing.hero.ajna.headline"
        subheading={
          <Trans
            i18nKey="landing.hero.ajna.subheader"
            components={[
              <AppLink
                // sx={{ fontSize: 'inherit' }}
                href="https://oasis.app/anja"
              />,
            ]}
          />
        }
      />
      <Box
        sx={{
          ...slideInAnimation,
          position: 'relative',
          animationDuration: '0.3s',
          animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
          width: '100%',
          mt: '126px',
        }}
        id="product-cards-wrapper"
      >
        <TabBar
          variant="large"
          useDropdownOnMobile
          defaultTab="borrow"
          sections={[
            {
              label: t('landing.tabs.ajna.borrow.tabLabel'),
              value: 'borrow',
              content: (
                <HomepageTabLayout
                  cards={
                    <ProductCardsWrapper sx={{ mt: '48px' }}>
                      {productCardsAjna.borrow.map((card) => (
                        <AlternateProductCard
                          header={card.header}
                          background={card.background}
                          icon={card.icon}
                          key={card.header}
                          banner={card.banner}
                          button={card.button}
                          labels={card.labels}
                        />
                      ))}
                    </ProductCardsWrapper>
                  }
                />
              ),
            },
            {
              label: t('landing.tabs.ajna.multiply.tabLabel'),
              value: 'multiply',
              content: (
                <HomepageTabLayout
                  cards={
                    <ProductCardsWrapper sx={{ mt: '48px' }}>
                      {productCardsAjna.borrow.map((card) => (
                        <AlternateProductCard
                          header={card.header}
                          background={card.background}
                          icon={card.icon}
                          key={card.header}
                          banner={card.banner}
                          button={card.button}
                          labels={card.labels}
                        />
                      ))}
                    </ProductCardsWrapper>
                  }
                />
              ),
            },
            {
              label: t('landing.tabs.ajna.earn.tabLabel'),
              value: 'earn',
              content: (
                <HomepageTabLayout
                  cards={
                    <ProductCardsWrapper sx={{ mt: '48px' }}>
                      {productCardsAjna.borrow.map((card) => (
                        <AlternateProductCard
                          header={card.header}
                          background={card.background}
                          icon={card.icon}
                          key={card.header}
                          banner={card.banner}
                          button={card.button}
                          labels={card.labels}
                        />
                      ))}
                    </ProductCardsWrapper>
                  }
                />
              ),
            },
          ]}
        />
      </Box>
      {otherAssets && otherAssets?.length > 0 && (
        <Flex
          sx={{
            mt: '56px',
            pt: 5,
            flexDirection: 'column',
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'neutral20',
          }}
        >
          <Heading
            as="h2"
            sx={{
              fontSize: '28px',
              fontWeight: 'semiBold',
              mb: '40px',
              color: 'primary100',
            }}
          >
            Other assets you can borrow against
          </Heading>
          <Flex as="ul" sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 2, listStyle: 'none', p: 0 }}>
            {otherAssets.map(({ link, token }, i) => (
              <Box key={i} as="li">
                <AssetPill icon={getToken(token).iconCircle} label={token} link={link} />
              </Box>
            ))}
          </Flex>
        </Flex>
      )}
      <Flex
        sx={{
          ...slideInAnimation,
          position: 'relative',
          animationDuration: '0.6s',
          animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 7,
        }}
      >
        <Text variant="header3" sx={{ mt: 7, mb: 4 }}>
          {t('landing.benefits.ajna.header')}
        </Text>
        <Text
          variant="paragraph1"
          sx={{ mb: '48px', color: 'neutral80', maxWidth: '740px', textAlign: 'center' }}
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
      <Box
        sx={{
          ...slideInAnimation,
          position: 'relative',
          animationDuration: '0.6s',
          animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
          mb: '127px',
        }}
      >
        <Text variant="header3" sx={{ textAlign: 'center', mt: '205px', mb: 4 }}>
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
                href: 'https://kb.oasis.app/help/getting-started',
                text: t('landing.info-cards.learn.get-started'),
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
                text: t('landing.info-cards.support.faq'),
              },
              {
                href: 'https://discord.gg/oasisapp',
                text: t('landing.info-cards.support.discord'),
              },
              {
                href: '/daiwallet/contact',
                text: t('landing.info-cards.support.contact-us'),
              },
              {
                href: 'https://twitter.com/oasisdotapp',
                text: t('landing.info-cards.support.twitter'),
              },
            ]}
            backgroundGradient="linear-gradient(135.35deg, #FEF7FF 0.6%, #FEE9EF 100%), radial-gradient(261.45% 254.85% at 3.41% 2.19%, #FFFADD 0%, #FFFBE3 0.01%, #F0FFF2 52.6%, #FBEDFD 100%)"
            backgroundImage="/static/img/info_cards/bubbles.png"
          />
        </Grid>
      </Box>
    </Box>
  )
}
