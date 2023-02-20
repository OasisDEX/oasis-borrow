import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { HomePageBanner } from 'components/HomePageBanner'
import { HomepageTabLayout } from 'components/HomepageTabLayout'
import { InfoCard } from 'components/InfoCard'
import { AppLink } from 'components/Links'
import {
  BorrowProductCardsContainer,
  EarnProductCardsContainer,
  MultiplyProductCardsContainer,
} from 'components/productCards/ProductCardsContainer'
import { TabBar } from 'components/TabBar'
import { LANDING_PILLS } from 'content/landing'
import { NewsletterSection } from 'features/newsletter/NewsletterView'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { productCardsConfig } from 'helpers/productCards'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { Trans, useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'
import { Box, Flex, Grid, Heading, Image, SxProps, SxStyleProp, Text } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

import { HomepageHeadline } from './common/HomepageHeadline'
import { HomepagePromoBlock } from './common/HomepagePromoBlock'

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

export function HomepageView() {
  const { t } = useTranslation()

  const referralsEnabled = useFeatureToggle('Referrals')
  const notificationsEnabled = useFeatureToggle('Notifications')
  const aaveV3EarnWSTETHEnabled = useFeatureToggle('AaveV3EarnWSTETH')
  const { context$, checkReferralLocal$, userReferral$ } = useAppContext()
  const [context] = useObservable(context$)
  const [checkReferralLocal] = useObservable(checkReferralLocal$)
  const [userReferral] = useObservable(userReferral$)
  const [landedWithRef, setLandedWithRef] = useState('')
  const [localReferral, setLocalReferral] = useLocalStorage('referral', null)

  const router = useRouter()

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
        ...slideInAnimation,
        position: 'relative',
        animationDuration: '0.4s',
        animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
      }}
    >
      {aaveV3EarnWSTETHEnabled && (
        <Flex
          sx={{
            justifyContent: 'center',
            mt: '80px',
            mb: 0,
          }}
        >
          <HomePageBanner
            heading={t('ref.banner')}
            link="https://blog.oasis.app/expanding-earn-with-aave-v3/"
          />
        </Flex>
      )}

      {referralsEnabled && landedWithRef && context?.status === 'connectedReadonly' && (
        <NewReferralModal />
      )}
      {(referralsEnabled || notificationsEnabled) && <TermsOfService userReferral={userReferral} />}
      <Hero
        isConnected={context?.status === 'connected'}
        heading="landing.hero.maker.headline"
        subheading={<Trans i18nKey="landing.hero.maker.subheader" components={[<br />]} />}
      />

      <Pills
        sx={{
          mb: 5,
        }}
      />

      <Stats
        sx={{
          mb: 6,
        }}
      />

      <Box
        sx={{
          width: '100%',
          mt: '126px',
        }}
        id="product-cards-wrapper"
      >
        <TabBar
          variant="large"
          useDropdownOnMobile
          defaultTab="multiply"
          sections={[
            {
              label: t('landing.tabs.maker.multiply.tabLabel'),
              value: 'multiply',
              content: (
                <HomepageTabLayout
                  paraText={
                    <>
                      {t('landing.tabs.maker.multiply.tabParaContent')}{' '}
                      <AppLink href="/multiply" variant="inText">
                        {t('landing.tabs.maker.multiply.tabParaLinkContent')}
                      </AppLink>
                      <Box sx={{ mt: 3 }}>
                        {t('landing.tabs.maker.multiply.aaveTabParaContent')}{' '}
                        <AppLink
                          href="https://blog.oasis.app/introducing-oasis-multiply-for-aave/"
                          variant="inText"
                        >
                          {t('landing.tabs.maker.multiply.aaveTabParaLinkContent')}
                        </AppLink>
                      </Box>
                    </>
                  }
                  cards={
                    <MultiplyProductCardsContainer
                      strategies={{
                        maker: productCardsConfig.landing.featuredIlkCards['multiply'],
                        aave: productCardsConfig.landing.featuredAaveCards['multiply'],
                      }}
                    />
                  }
                />
              ),
            },
            {
              label: t('landing.tabs.maker.borrow.tabLabel'),
              value: 'borrow',
              content: (
                <HomepageTabLayout
                  paraText={
                    <>
                      <Text as="p">{t('landing.tabs.maker.borrow.tabParaContent')} </Text>
                      <AppLink href="/borrow" variant="inText">
                        {t('landing.tabs.maker.borrow.tabParaLinkContent')}
                      </AppLink>
                    </>
                  }
                  cards={
                    <BorrowProductCardsContainer
                      strategies={{
                        maker: productCardsConfig.landing.featuredIlkCards['borrow'],
                        aave: [],
                      }}
                    />
                  }
                />
              ),
            },

            {
              label: t('landing.tabs.maker.earn.tabLabel'),
              value: 'earn',
              content: (
                <HomepageTabLayout
                  paraText={
                    <>
                      {t('landing.tabs.maker.earn.tabParaContent')}{' '}
                      <AppLink href="/earn" variant="inText">
                        {t('landing.tabs.maker.earn.tabParaLinkContent')}
                      </AppLink>
                    </>
                  }
                  cards={
                    <EarnProductCardsContainer
                      strategies={{
                        maker: productCardsConfig.landing.featuredIlkCards['earn'],
                        aave: productCardsConfig.landing.featuredAaveCards['earn'],
                      }}
                    />
                  }
                />
              ),
            },
          ]}
        />
      </Box>
      <Box>
        <Text variant="header3" sx={{ textAlign: 'center', mt: 7, mb: 6 }}>
          Why use Oasis.app
        </Text>
        <HomepageHeadline
          primaryText="Earn long term sustainable yields to compound your crypto capital: "
          secondaryText="Oasis Earn"
          ctaURL={INTERNAL_LINKS.earn}
          ctaLabel="Open position"
        />
        <Grid columns={3} sx={{ mt: 5, mb: 7 }}>
          <HomepagePromoBlock
            title="Earn on the crypto assets you already own"
            background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/1_earn_on_assets.svg')}
          />
          <HomepagePromoBlock
            title="More predictable payoff with transparancy on fees and net APY’s"
            background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
            image={staticFilesRuntimeUrl('/static/img/homepage/2_predictable_payoff.svg')}
          />
          <HomepagePromoBlock
            title="Simple to use management tools and analytics"
            background="linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/3_simple_management_tools.svg')}
          />
        </Grid>
        <HomepageHeadline
          primaryText="Get the most out your crypto without selling: "
          secondaryText="Oasis Borrow"
          ctaURL={INTERNAL_LINKS.borrow}
          ctaLabel="Open position"
        />
        <Grid columns={3} sx={{ mt: 5 }}>
          <HomepagePromoBlock
            title="Low borrowing costs"
            background="linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/4_low_borrowing_cost.svg')}
            height="360px"
          />
          <HomepagePromoBlock
            title="Ample liquidity from multiple Protocols"
            background="linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/5_ample_liquidity.svg')}
            height="360px"
          />
          <HomepagePromoBlock
            title="Available for top tier crypto collateral"
            background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
            image={staticFilesRuntimeUrl('/static/img/homepage/6_top_tier_collateral.svg')}
            height="360px"
          />
        </Grid>
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 7 }}>
          <HomepageHeadline
            primaryText="Optimize your risk & reward with one click: "
            secondaryText="Oasis Multiply"
            ctaURL={INTERNAL_LINKS.multiply}
            ctaLabel="Open position"
          />
          <HomepagePromoBlock
            title="Take advantage of market volatility"
            background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/7_market_volatility_advantage.svg')}
          />
        </Flex>
        <Grid columns={['1fr 2fr']} sx={{ mt: 3, mb: 7 }}>
          <HomepagePromoBlock
            title="Reduce the anxiety of liquidation with stop loss automation"
            background="linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF"
            image={staticFilesRuntimeUrl('/static/img/homepage/8_reduce_anxiety.svg')}
          />
          <HomepagePromoBlock
            title={
              <>
                Increase the potential{' '}
                <Text as="span" color="neutral80">
                  profit
                </Text>{' '}
                and{' '}
                <Text as="span" color="neutral80">
                  payoff
                </Text>{' '}
                of your
                <br />
                crypto asset position
              </>
            }
            background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
            image={staticFilesRuntimeUrl('/static/img/homepage/9_profit_and_payoff.svg')}
            width="100%"
          />
        </Grid>
        <HomepageHeadline
          primaryText="Advanced automation tools can manage your positions for you: "
          secondaryText="set and forget with confidence"
          maxWidth="860px"
        />
        <Grid columns={2} sx={{ mt: 5 }}>
          <HomepagePromoBlock.Big background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)">
            <Flex
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '100%',
              }}
            >
              <Text variant="header5" sx={{ my: '20px', mx: '12px' }}>
                Get peace of mind with protection against liquidation and capital losses with
                Stop-Loss and Auto-Sell.
              </Text>
              <Image
                src={staticFilesRuntimeUrl('/static/img/homepage/10_peace_of_mind.svg')}
                sx={{
                  mx: 3,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  minWidth: '252px',
                }}
              />
            </Flex>
          </HomepagePromoBlock.Big>
          <HomepagePromoBlock.Big background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF">
            <Flex
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Image
                src={staticFilesRuntimeUrl('/static/img/homepage/11_no_hassle.svg')}
                sx={{
                  my: 3,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
              <Text variant="header5" sx={{ mb: 3, mx: '12px', textAlign: 'center' }}>
                Make position management less of a hassle with automated Buys, Sells and Take Profit
              </Text>
            </Flex>
          </HomepagePromoBlock.Big>
        </Grid>
        <HomepagePromoBlock.Big
          background="linear-gradient(90.65deg, #FCF1FE 1.31%, #FFF1F6 99.99%)"
          height="128px"
          sx={{ mt: 3 }}
        >
          <Text variant="header3" sx={{ textAlign: 'center' }}>
            stats go here
          </Text>
        </HomepagePromoBlock.Big>
        <HomepageHeadline
          primaryText="Your funds, your choice: "
          secondaryText="park your capital and stay in full control all the time, with no exceptions"
          ctaURL={EXTERNAL_LINKS.HELP}
          ctaLabel="Know more about security"
        />
      </Box>
      <Box>
        <Text variant="header3" sx={{ textAlign: 'center', mt: 7, mb: 4 }}>
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
                href: `${EXTERNAL_LINKS.HELP}/frequently-asked-questions`,
                text: t('landing.info-cards.support.faq'),
              },
              {
                href: EXTERNAL_LINKS.DISCORD,
                text: t('landing.info-cards.support.discord'),
              },
              {
                href: INTERNAL_LINKS.daiWalletContact,
                text: t('landing.info-cards.support.contact-us'),
              },
              {
                href: EXTERNAL_LINKS.TWITTER,
                text: t('landing.info-cards.support.twitter'),
              },
            ]}
            backgroundGradient="linear-gradient(135.35deg, #FEF7FF 0.6%, #FEE9EF 100%), radial-gradient(261.45% 254.85% at 3.41% 2.19%, #FFFADD 0%, #FFFBE3 0.01%, #F0FFF2 52.6%, #FBEDFD 100%)"
            backgroundImage="/static/img/info_cards/bubbles.png"
          />
        </Grid>
      </Box>
      <Box>
        <Text variant="header3" sx={{ textAlign: 'center', mt: 7, mb: 4 }}>
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
                href: INTERNAL_LINKS.multiply,
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
                href: INTERNAL_LINKS.borrow,
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
                href: INTERNAL_LINKS.connect,
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

export function Hero({
  sx,
  isConnected,
  heading,
  subheading,
}: {
  sx?: SxStyleProp
  isConnected: boolean
  heading: string
  subheading: ReactNode
}) {
  const { t } = useTranslation()
  const referralsEnabled = useFeatureToggle('Referrals')

  return (
    <Flex
      sx={{
        position: 'relative',
        justifySelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        mt: referralsEnabled ? '24px' : '64px',
        mb: 5,
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Heading as="h1" variant="header1" sx={{ mb: 3 }}>
        {t(heading)}
      </Heading>
      <Text variant="paragraph1" sx={{ mb: 4, color: 'neutral80', maxWidth: '740px' }}>
        {subheading}
      </Text>
      <AppLink
        href={isConnected ? INTERNAL_LINKS.homepage : INTERNAL_LINKS.connect}
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
