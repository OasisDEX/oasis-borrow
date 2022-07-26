import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { ReferralBanner } from 'components/ReferralBanner'
import { TabBar } from 'components/TabBar'
import { LANDING_PILLS } from 'content/landing'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { Trans, useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Box, Flex, Grid, Heading, SxProps, SxStyleProp, Text } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { InfoCard } from '../../components/InfoCard'
import { AppLink } from '../../components/Links'
import {
  BorrowProductCardsContainer,
  EarnProductCardsContainer,
  MultiplyProductCardsContainer,
} from '../../components/productCards/ProductCardsContainer'
import { useObservable } from '../../helpers/observableHook'
import { productCardsConfig } from '../../helpers/productCards'
import { fadeInAnimation, slideInAnimation } from '../../theme/animations'
import { NewsletterSection } from '../newsletter/NewsletterView'

interface PillProps {
  label: string
  link: string
  icon: string
}

function Pill(props: PillProps) {
  return (
    <AppLink
      href={props.link}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 140,
        background: 'rgba(255, 255, 255, 0.5)',
        mx: 2,
        my: 2,
        borderRadius: 'round',
        variant: 'text.paragraph2',
        fontWeight: 'semiBold',
        color: 'neutral80',
        py: 2,
        border: '1px solid',
        borderColor: 'neutral20',
        transition: 'background 0.2s ease-in-out',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.8)',
        },
      }}
    >
      <Icon name={props.icon} size="26px" sx={{ mr: 2 }} />
      {props.label}
    </AppLink>
  )
}
function Pills({ sx }: { sx?: SxProps }) {
  return (
    <Flex sx={{ width: '100%', justifyContent: 'center', flexWrap: 'wrap', ...sx }}>
      {LANDING_PILLS.map((pill) => (
        <Pill key={pill.label} label={pill.label} link={pill.link} icon={pill.icon} />
      ))}
    </Flex>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: [3, 1, 1] }}>
      <Text
        variant="paragraph2"
        sx={{ textAlign: 'center', fontWeight: 'semiBold', color: 'neutral80' }}
      >
        {label}
      </Text>
      <Text variant="header2" sx={{ textAlign: 'center' }}>
        {value}
      </Text>
    </Box>
  )
}

function Stats({ sx }: { sx?: SxProps }) {
  const { t } = useTranslation()
  const { getOasisStats$ } = useAppContext()

  const [oasisStatsValue] = useObservable(getOasisStats$())

  if (!oasisStatsValue) {
    return null
  }

  return (
    <Grid columns={[1, 3, 3]} sx={{ justifyContent: 'center', ...sx }}>
      <StatCell
        label={t('landing.stats.30-day-volume')}
        value={`$${formatAsShorthandNumbers(new BigNumber(oasisStatsValue.monthlyVolume), 2)}`}
      />
      <StatCell
        label={t('landing.stats.managed-on-oasis')}
        value={`$${formatAsShorthandNumbers(new BigNumber(oasisStatsValue.managedOnOasis), 2)}`}
      />
      <StatCell
        label={t('landing.stats.median-vault')}
        value={`$${formatAsShorthandNumbers(new BigNumber(oasisStatsValue.medianVaultSize), 2)}`}
      />
    </Grid>
  )
}

function HomepageTabLayout(props: { paraText?: JSX.Element; cards: JSX.Element }) {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Text
        variant="paragraph2"
        sx={{
          mt: 4,
          color: 'neutral80',
          maxWidth: 617,
          textAlign: 'center',
          mb: 5,
          ...fadeInAnimation,
        }}
      >
        {props.paraText}
      </Text>
      {props.cards}
    </Flex>
  )
}

export function HomepageView() {
  const { t } = useTranslation()

  const referralsEnabled = useFeatureToggle('Referrals')
  const { context$, checkReferralLocal$, userReferral$ } = useAppContext()
  const [context] = useObservable(context$)
  const [checkReferralLocal] = useObservable(checkReferralLocal$)
  const [userReferral] = useObservable(userReferral$)
  const [landedWithRef, setLandedWithRef] = useState('')
  const [localReferral, setLocalReferral] = useLocalStorage('referral', null)

  const router = useRouter()
  const standardAnimationDuration = '0.7s'

  useEffect(() => {
    if (!localReferral && referralsEnabled) {
      const linkReferral = router.query.ref as string
      if (linkReferral) {
        setLocalReferral(linkReferral)
        setLandedWithRef(linkReferral)
      }
    }
  }, [checkReferralLocal, router.isReady])

  return (
    <Box
      sx={{
        flex: 1,
      }}
    >
      {referralsEnabled && (
        <Flex
          sx={{
            justifyContent: 'center',
            mt: '80px',
            mb: 0,
          }}
        >
          <ReferralBanner
            heading={t('ref.banner')}
            link={userReferral?.user ? `/referrals/${userReferral.user.address}` : '/referrals'}
          ></ReferralBanner>
        </Flex>
      )}
      {referralsEnabled && landedWithRef && context?.status === 'connectedReadonly' && (
        <NewReferralModal />
      )}
      {referralsEnabled && userReferral?.referrer && <TermsOfService userReferral={userReferral} />}
      <Hero
        isConnected={context?.status === 'connected'}
        sx={{
          ...slideInAnimation,
          position: 'relative',
          animationDuration: standardAnimationDuration,
          animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
        }}
      />

      <Pills
        sx={{
          mb: 5,
          ...slideInAnimation,
          position: 'relative',
          animationDuration: standardAnimationDuration,
        }}
      />

      <Stats
        sx={{
          mb: 6,
          ...slideInAnimation,
          position: 'relative',
          animationDuration: standardAnimationDuration,
        }}
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
          sections={[
            {
              label: t('landing.tabs.multiply.tabLabel'),
              value: 'multiply',
              content: (
                <HomepageTabLayout
                  paraText={
                    <>
                      {t('landing.tabs.multiply.tabParaContent')}{' '}
                      <AppLink href="/multiply" variant="inText">
                        {t('landing.tabs.multiply.tabParaLinkContent')}
                      </AppLink>
                    </>
                  }
                  cards={
                    <MultiplyProductCardsContainer
                      ilks={productCardsConfig.landing.featuredCards['multiply']}
                    />
                  }
                />
              ),
            },
            {
              label: t('landing.tabs.borrow.tabLabel'),
              value: 'borrow',
              content: (
                <HomepageTabLayout
                  paraText={
                    <>
                      <Text as="p">{t('landing.tabs.borrow.tabParaContent')} </Text>
                      <AppLink href="/borrow" variant="inText">
                        {t('landing.tabs.borrow.tabParaLinkContent')}
                      </AppLink>
                    </>
                  }
                  cards={
                    <BorrowProductCardsContainer
                      ilks={productCardsConfig.landing.featuredCards['borrow']}
                    />
                  }
                />
              ),
            },

            {
              label: t('landing.tabs.earn.tabLabel'),
              value: 'earn',
              content: (
                <HomepageTabLayout
                  paraText={
                    <>
                      {t('landing.tabs.earn.tabParaContent')}{' '}
                      <AppLink href="/earn" variant="inText">
                        {t('landing.tabs.earn.tabParaLinkContent')}
                      </AppLink>
                    </>
                  }
                  cards={
                    <EarnProductCardsContainer
                      ilks={productCardsConfig.landing.featuredCards['earn']}
                    />
                  }
                />
              ),
            },
          ]}
        />
      </Box>
      <Box
        sx={{
          ...slideInAnimation,
          position: 'relative',
          animationDuration: '0.6s',
          animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
        }}
      >
        <Text variant="header2" sx={{ textAlign: 'center', mt: 7, mb: 4 }}>
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
                href: '/support',
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
      <Box
        sx={{
          ...slideInAnimation,
          position: 'relative',
          animationDuration: '0.9s',
          animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
        }}
      >
        <Text variant="header2" sx={{ textAlign: 'center', mt: 7, mb: 4 }}>
          {t('landing.info-cards.get-started')}
        </Text>
        <Grid
          gap={4}
          sx={{
            maxWidth: '944px',
            margin: 'auto',
            gridTemplateColumns: ['1fr', '379px 1fr'],
            gridTemplateAreas: [
              'none',
              `"left topRight"
            "left bottomRight"`,
            ],
          }}
        >
          <InfoCard
            title={t('landing.info-cards.multiply.multiply')}
            subtitle={t('landing.info-cards.multiply.subtitle')}
            links={[
              {
                href: '/multiply',
                text: t('landing.info-cards.multiply.open-vault'),
              },
            ]}
            backgroundGradient="linear-gradient(141.11deg, #EBFAFF 0.79%, #EBF2FF 98.94%), linear-gradient(127.5deg, #EEE1F9 0%, #FFECE8 56.77%, #DDFFF7 100%)"
            backgroundImage="/static/img/info_cards/pills.png"
            sx={{
              gridArea: [null, 'left'],
              backgroundSize: ['70%, cover', '300px, cover'],
            }}
          />
          <InfoCard
            sx={{
              gridArea: [null, 'topRight'],
            }}
            title={t('landing.info-cards.borrow.borrow-dai')}
            subtitle={t('landing.info-cards.borrow.choose-your-preferred-token')}
            links={[
              {
                href: '/borrow',
                text: t('landing.info-cards.borrow.open-vault'),
              },
            ]}
            backgroundGradient="linear-gradient(98.21deg, #FFFBE8 2.63%, #FFF0E8 99.63%), linear-gradient(127.5deg, #E4F9C9 0%, #E8FFF5 49.48%, #F9E1EB 100%)"
            backgroundImage="/static/img/info_cards/dai.png"
          />
          <InfoCard
            sx={{
              gridArea: [null, 'bottomRight'],
            }}
            title={t('landing.info-cards.manage.manage-your-vault')}
            subtitle={t('landing.info-cards.manage.make-actions')}
            links={[
              {
                href: '/connect',
                text: t('landing.info-cards.manage.connect-your-wallet'),
              },
            ]}
            backgroundGradient="linear-gradient(127.5deg, #E8EAFF 0%, #EEF0FF 0%, #FFF3FA 100%), linear-gradient(127.5deg, #DDFFF7 0%, #E8EAFF 61.98%, #F9E1EF 100%)"
            backgroundImage="/static/img/info_cards/safe.png"
          />
        </Grid>
      </Box>
      <Flex mb={4} mt={7} sx={{ justifyContent: 'center' }}>
        <NewsletterSection />
      </Flex>
    </Box>
  )
}

export function Hero({ sx, isConnected }: { sx?: SxStyleProp; isConnected: boolean }) {
  const { t } = useTranslation()
  const referralsEnabled = useFeatureToggle('Referrals')
  const [heading, subheading] = ['landing.hero.headline', 'landing.hero.subheader']

  return (
    <Flex
      sx={{
        ...sx,
        justifySelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        mt: referralsEnabled ? '24px' : '64px',
        mb: 5,
        flexDirection: 'column',
      }}
    >
      <Heading as="h1" variant="header1" sx={{ mb: 3 }}>
        {t(heading)}
      </Heading>
      <Text variant="paragraph1" sx={{ mb: 4, color: 'neutral80', maxWidth: '740px' }}>
        <Trans i18nKey={subheading} components={[<br />]} />
      </Text>
      <AppLink
        href={isConnected ? '/' : '/connect'}
        variant="primary"
        sx={{
          display: 'flex',
          margin: '0 auto',
          px: '40px',
          py: 2,
          alignItems: 'center',
          '&:hover svg': {
            transform: 'translateX(10px)',
          },
        }}
        hash={isConnected ? 'product-cards-wrapper' : ''}
      >
        {isConnected ? t('see-products') : t('connect-wallet')}
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
    </Flex>
  )
}
