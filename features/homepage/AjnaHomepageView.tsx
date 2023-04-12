import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { useAppContext } from 'components/AppContextProvider'
import { AssetPill } from 'components/AssetPill'
import { BenefitCard, BenefitCardsWrapper } from 'components/BenefitCard'
import { HomepageTabLayout } from 'components/HomepageTabLayout'
import { LandingBanner } from 'components/LandingBanner'
import { AppLink } from 'components/Links'
import { TabBar } from 'components/TabBar'
import { AjnaHaveSomeQuestions } from 'features/ajna/common/components/AjnaHaveSomeQuestions'
import { otherAssets } from 'features/ajna/common/controls/AjnaNavigationController'
import { AjnaProductCardBorrowController } from 'features/ajna/common/controls/AjnaProductCardBorrowController'
import { AjnaProductCardEarnController } from 'features/ajna/common/controls/AjnaProductCardEarnController'
import { Hero } from 'features/homepage/HomepageView'
import { useObservable } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

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
                sx={{ fontSize: 'inherit', fontWeight: 'regular' }}
                href="https://oasis.app/anja"
              />,
            ]}
          />
        }
        showButton={false}
      />
      <Box
        sx={{
          width: '100%',
          mt: '84px',
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
              content: <HomepageTabLayout cards={<AjnaProductCardBorrowController />} />,
            },
            // // TODO uncomment and configure once multiply available
            // {
            //   label: t('landing.tabs.ajna.multiply.tabLabel'),
            //   value: 'multiply',
            //   content: <HomepageTabLayout cards={<AjnaProductCardBorrowController />} />,
            // },
            {
              label: t('landing.tabs.ajna.earn.tabLabel'),
              value: 'earn',
              content: <HomepageTabLayout cards={<AjnaProductCardEarnController />} />,
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
              textAlign: 'center',
            }}
          >
            {t('ajna.other-assets')}
          </Heading>
          <Flex
            as="ul"
            sx={{
              flexWrap: 'wrap',
              columnGap: 3,
              rowGap: 2,
              listStyle: 'none',
              p: 0,
              justifyContent: 'center',
            }}
          >
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
