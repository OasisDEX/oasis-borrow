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
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { useWeb3OnBoardConnection } from 'features/web3OnBoard'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { productCardsConfig } from 'helpers/productCards'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { debounce } from 'lodash'
import { Trans, useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Image, SxProps, SxStyleProp, Text } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'
import { useOnMobile } from 'theme/useBreakpointIndex'

import { HomepageHeadline } from './common/HomepageHeadline'
import { HomepagePromoBlock } from './common/HomepagePromoBlock'
import { OasisStats } from './OasisStats'

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

function ManagedVolumeStats({
  sx,
  oasisStatsValue,
}: {
  sx?: SxProps
  oasisStatsValue?: OasisStats
}) {
  const { t } = useTranslation()

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
        label={t('landing.stats.collateral-automated')}
        value={`$${formatAsShorthandNumbers(
          new BigNumber(oasisStatsValue.lockedCollateralActiveTrigger),
          2,
        )}`}
      />
    </Grid>
  )
}

function WhyOasisStats({ oasisStatsValue }: { oasisStatsValue?: OasisStats }) {
  const { t } = useTranslation()

  if (!oasisStatsValue) {
    return null
  }
  return (
    <HomepagePromoBlock.Big
      background="linear-gradient(90.65deg, #FCF1FE 1.31%, #FFF1F6 99.99%)"
      height={['auto ', '128px']}
      sx={{ mt: 3, pt: 4 }}
    >
      <Grid columns={['1fr', '1fr 1fr 1fr 1fr']}>
        <Box sx={{ my: ['30px', 0] }}>
          <Text variant="boldParagraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
            {t('landing.stats.vaults-automated')}
          </Text>
          <Text variant="header4" sx={{ textAlign: 'center' }}>
            {oasisStatsValue.vaultsWithActiveTrigger}
          </Text>
        </Box>
        <Box sx={{ my: ['30px', 0] }}>
          <Text variant="boldParagraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
            {t('landing.stats.collateral-automated')}
          </Text>
          <Text variant="header4" sx={{ textAlign: 'center' }}>
            $
            {formatAsShorthandNumbers(
              new BigNumber(oasisStatsValue.lockedCollateralActiveTrigger),
              2,
            )}
          </Text>
        </Box>
        <Box sx={{ my: ['30px', 0] }}>
          <Text variant="boldParagraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
            {t('landing.stats.actions-executed')}
          </Text>
          <Text variant="header4" sx={{ textAlign: 'center' }}>
            {oasisStatsValue.executedTriggersLast90Days}
          </Text>
        </Box>
        <Box sx={{ my: ['30px', 0] }}>
          <Text variant="boldParagraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
            {t('landing.stats.success-rate')}
          </Text>
          <Text variant="header4" sx={{ textAlign: 'center' }}>
            {oasisStatsValue.triggersSuccessRate}%
          </Text>
        </Box>
      </Grid>
    </HomepagePromoBlock.Big>
  )
}

export function HomepageView() {
  const { t } = useTranslation()
  const { getOasisStats$ } = useAppContext()

  const [oasisStatsValue] = useObservable(getOasisStats$())

  const referralsEnabled = useFeatureToggle('Referrals')
  const notificationsEnabled = useFeatureToggle('Notifications')
  const aaveV3EarnWSTETHEnabled = useFeatureToggle('AaveV3EarnWSTETH')
  const { context$, checkReferralLocal$, userReferral$ } = useAppContext()
  const [context] = useObservable(context$)
  const [checkReferralLocal] = useObservable(checkReferralLocal$)
  const [userReferral] = useObservable(userReferral$)
  const [landedWithRef, setLandedWithRef] = useState('')
  const [localReferral, setLocalReferral] = useLocalStorage('referral', '')
  const [scrollPercentage, setScrollPercentage] = useState(0)
  // Magic number which is the rough height of three HomepagePromoBlocks + margins (search for sub-headers.security)
  // Why: cause the refs + calculations were singnificantly expensive than this
  // If you ever add/subtract a block from there this number needs to change
  const controlPointsHeight = 2000
  // Rough height of the HomepagePromoBlock mentioned above
  const controlPointsBlockHeight = 330

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

  const scrollingBlockRef = useRef<HTMLDivElement>(null)
  const scrollingGridRef = useRef<HTMLDivElement>(null)
  const isMobileView = useOnMobile()

  useEffect(() => {
    const body = document.querySelectorAll('body')[0]
    if (!body || isMobileView) return
    const eventHandler = (_event: Event) => {
      // no memo, these are not expensive calculations
      const scrollingBlockElementRect = scrollingBlockRef.current?.getBoundingClientRect()
      const scrollingGridElementRect = scrollingGridRef.current?.getBoundingClientRect()
      const scrollingBlockPositionTop = scrollingBlockElementRect?.top || 0
      const scrollingGridPositionTop = scrollingGridElementRect?.top || 0
      const currentPositionsDiff = Math.abs(scrollingGridPositionTop - scrollingBlockPositionTop)
      const endPositionsDiff = controlPointsHeight - controlPointsBlockHeight
      const tempScrollPercentage = (currentPositionsDiff / endPositionsDiff) * 100
      setScrollPercentage(tempScrollPercentage)
    }

    body.addEventListener('scroll', debounce(eventHandler, 50))
    return () => {
      body.removeEventListener('scroll', debounce(eventHandler, 50))
    }
  }, [isMobileView])

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
            link={EXTERNAL_LINKS.BLOG.EXPANDING_EARN_AAVE_V3}
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
      <Pills sx={{ mb: 5 }} />
      <ManagedVolumeStats sx={{ mb: 6 }} oasisStatsValue={oasisStatsValue} />
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
          defaultTab="earn"
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
                        <AppLink href={EXTERNAL_LINKS.BLOG.MULTIPLY_FOR_AAVE} variant="inText">
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
                        aave: productCardsConfig.landing.featuredAaveCards['borrow'],
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
        <Text variant="header2" sx={{ textAlign: 'center', mt: 7, mb: 6 }}>
          {t('landing.why-oasis.main-header')}
        </Text>
        <HomepageHeadline
          primaryText={t('landing.why-oasis.sub-headers.earn.primary')}
          secondaryText={t('landing.why-oasis.sub-headers.earn.secondary')}
          ctaLabel={t('landing.why-oasis.sub-headers.earn.cta')}
          ctaURL={INTERNAL_LINKS.earn}
        />
        <Grid columns={[1, 3]} sx={{ mt: 5, mb: 7 }}>
          <HomepagePromoBlock
            title={t('landing.why-oasis.image-labels.1-earn-on-assets')}
            background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/1_earn_on_assets.svg')}
          />
          <HomepagePromoBlock
            title={t('landing.why-oasis.image-labels.2-predictable-payoff')}
            background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
            image={staticFilesRuntimeUrl('/static/img/homepage/2_predictable_payoff.svg')}
          />
          <HomepagePromoBlock
            title={t('landing.why-oasis.image-labels.3-simple-management-tools')}
            background="linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/3_simple_management_tools.svg')}
          />
        </Grid>
        <HomepageHeadline
          primaryText={t('landing.why-oasis.sub-headers.borrow.primary')}
          secondaryText={t('landing.why-oasis.sub-headers.borrow.secondary')}
          ctaLabel={t('landing.why-oasis.sub-headers.borrow.cta')}
          ctaURL={INTERNAL_LINKS.borrow}
          maxWidth={'100%'}
        />
        <Grid columns={[1, 3]} sx={{ mt: 5 }}>
          <HomepagePromoBlock
            title={t('landing.why-oasis.image-labels.4-low-borrowing-cost')}
            background="linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/4_low_borrowing_cost.svg')}
            height="360px"
          />
          <HomepagePromoBlock
            title={t('landing.why-oasis.image-labels.5-ample-liquidity')}
            background="linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)"
            image={staticFilesRuntimeUrl('/static/img/homepage/5_ample_liquidity.svg')}
            height="360px"
          />
          <HomepagePromoBlock
            title={t('landing.why-oasis.image-labels.6-top-tier-collateral')}
            background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
            image={staticFilesRuntimeUrl('/static/img/homepage/6_top_tier_collateral.svg')}
            height="360px"
          />
        </Grid>
        {!isMobileView ? (
          <>
            <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 7 }}>
              <HomepageHeadline
                primaryText={t('landing.why-oasis.sub-headers.multiply.primary')}
                secondaryText={t('landing.why-oasis.sub-headers.multiply.secondary')}
                ctaLabel={t('landing.why-oasis.sub-headers.multiply.cta')}
                ctaURL={INTERNAL_LINKS.multiply}
              />
              <HomepagePromoBlock
                title={t('landing.why-oasis.image-labels.7-market-volatility-advantage')}
                background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)"
                image={staticFilesRuntimeUrl(
                  '/static/img/homepage/7_market_volatility_advantage.svg',
                )}
              />
            </Flex>
            <Grid columns={['1fr 2fr']} sx={{ mt: 3, mb: 7 }}>
              <HomepagePromoBlock
                title={t('landing.why-oasis.image-labels.8-reduce-anxiety')}
                background="linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF"
                image={staticFilesRuntimeUrl('/static/img/homepage/8_reduce_anxiety.svg')}
              />
              <HomepagePromoBlock
                title={
                  <Trans
                    i18nKey="landing.why-oasis.image-labels.9-profit-and-payoff"
                    components={[<Text as="span" color="neutral80" />]}
                  />
                }
                background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
                image={staticFilesRuntimeUrl('/static/img/homepage/9_profit_and_payoff.svg')}
                width="100%"
              />
            </Grid>
          </>
        ) : (
          <Grid columns={1} sx={{ mt: 3, my: 7 }}>
            <HomepageHeadline
              primaryText={t('landing.why-oasis.sub-headers.multiply.primary')}
              secondaryText={t('landing.why-oasis.sub-headers.multiply.secondary')}
              ctaLabel={t('landing.why-oasis.sub-headers.multiply.cta')}
              ctaURL={INTERNAL_LINKS.multiply}
              sx={{ mt: 2, mb: 5 }}
            />
            <HomepagePromoBlock
              title={t('landing.why-oasis.image-labels.7-market-volatility-advantage')}
              background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)"
              image={staticFilesRuntimeUrl(
                '/static/img/homepage/7_market_volatility_advantage.svg',
              )}
            />
            <HomepagePromoBlock
              title={t('landing.why-oasis.image-labels.8-reduce-anxiety')}
              background="linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF"
              image={staticFilesRuntimeUrl('/static/img/homepage/8_reduce_anxiety.svg')}
            />
            <HomepagePromoBlock
              title={
                <Trans
                  i18nKey="landing.why-oasis.image-labels.9-profit-and-payoff"
                  components={[<Text as="span" color="neutral80" />]}
                />
              }
              background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
              image={staticFilesRuntimeUrl('/static/img/homepage/9_profit_and_payoff_MOBILE.svg')}
            />
          </Grid>
        )}
        <HomepageHeadline
          primaryText={t('landing.why-oasis.sub-headers.automation.primary')}
          secondaryText={t('landing.why-oasis.sub-headers.automation.secondary')}
          maxWidth="860px"
        />
        <Grid columns={[1, 2]} sx={{ mt: 5 }}>
          <HomepagePromoBlock.Big
            height={['460px', '100%']}
            background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)"
          >
            <Flex
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: ['column', 'row'],
              }}
            >
              <Text variant="header5" sx={{ my: [3, '20px'], mx: [0, '12px'] }}>
                {t('landing.why-oasis.image-labels.10-peace-of-mind')}
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
          <HomepagePromoBlock.Big
            height={['320px', '100%']}
            background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
          >
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
              <Text variant="header5" sx={{ mb: 3, mx: [0, '12px'], textAlign: 'center' }}>
                {t('landing.why-oasis.image-labels.11-no-hassle')}
              </Text>
            </Flex>
          </HomepagePromoBlock.Big>
        </Grid>
        <WhyOasisStats oasisStatsValue={oasisStatsValue} />
        <Box
          sx={{
            mt: 7,
            position: 'relative',
            height: !isMobileView ? controlPointsHeight : undefined,
          }}
          ref={scrollingGridRef}
        >
          <Grid
            columns={['1fr', '2fr 1fr']}
            sx={
              !isMobileView
                ? {
                    position: 'sticky',
                    top: 'calc(50% - 165px)',
                    height: `${controlPointsBlockHeight}px`,
                  }
                : {}
            }
            ref={scrollingBlockRef}
          >
            <HomepageHeadline
              primaryText={t('landing.why-oasis.sub-headers.security.primary')}
              secondaryText={t('landing.why-oasis.sub-headers.security.secondary')}
              ctaLabel={t('landing.why-oasis.sub-headers.security.cta')}
              ctaURL={EXTERNAL_LINKS.KB.HELP}
              sx={{ alignSelf: 'center', mb: [5, 0] }}
            />
            <Box>
              <HomepagePromoBlock
                title={t('landing.why-oasis.image-labels.12-1-oasis-app')}
                background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
                image={staticFilesRuntimeUrl('/static/img/homepage/12_1_oasis_app.svg')}
                height={`${controlPointsBlockHeight}px`}
                sx={
                  !isMobileView
                    ? {
                        pb: 0,
                        opacity: scrollPercentage >= 0 && scrollPercentage < 25 ? 1 : 0,
                        position: 'absolute',
                        top: 0,
                      }
                    : { pb: 0, mb: 3 }
                }
                imageSx={{ mb: 0 }}
              />
              <HomepagePromoBlock
                title={t('landing.why-oasis.image-labels.12-2-verifiable-on-chain')}
                background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
                image={staticFilesRuntimeUrl('/static/img/homepage/12_2_verifiable_on_chain.svg')}
                height={`${controlPointsBlockHeight}px`}
                sx={
                  !isMobileView
                    ? {
                        pb: 0,
                        opacity: scrollPercentage >= 25 && scrollPercentage < 75 ? 1 : 0,
                        position: 'absolute',
                        top: 0,
                      }
                    : { pb: 0, mb: 3 }
                }
                imageSx={{ mb: 0 }}
              />
              <HomepagePromoBlock
                title={t('landing.why-oasis.image-labels.12-3-no-black-boxes')}
                background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
                image={staticFilesRuntimeUrl('/static/img/homepage/12_3_no_black_boxes.svg')}
                height={`${controlPointsBlockHeight}px`}
                sx={
                  !isMobileView
                    ? {
                        pb: 0,
                        opacity: scrollPercentage >= 75 && scrollPercentage <= 100 ? 1 : 0,
                        position: 'absolute',
                        top: 0,
                      }
                    : { pb: 0, mb: 3 }
                }
                imageSx={{ mb: 0 }}
              />
            </Box>
          </Grid>
        </Box>
      </Box>
      <Box sx={{ mb: 6 }}>
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
                href: EXTERNAL_LINKS.KB.GETTING_STARTED,
                text: t('landing.info-cards.learn.get-started'),
              },
              {
                href: EXTERNAL_LINKS.KB.TUTORIALS,
                text: t('landing.info-cards.learn.tutorials'),
              },
              {
                href: EXTERNAL_LINKS.KB.BORROW,
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
                href: `${EXTERNAL_LINKS.KB.HELP}/frequently-asked-questions`,
                text: t('landing.info-cards.support.faq'),
              },
              {
                href: EXTERNAL_LINKS.DISCORD,
                text: t('landing.info-cards.support.discord'),
              },
              {
                href: EXTERNAL_LINKS.KB.CONTACT,
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
    </Box>
  )
}

export function Hero({
  sx,
  isConnected,
  heading,
  subheading,
  showButton = true,
}: {
  sx?: SxStyleProp
  isConnected: boolean
  heading: string
  subheading: ReactNode
  showButton?: boolean
}) {
  const { t } = useTranslation()
  const referralsEnabled = useFeatureToggle('Referrals')
  const { connecting, connected, executeConnection } = useWeb3OnBoardConnection({
    walletConnect: true,
  })

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
      {showButton && (
        <Button
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
          onClick={async () => connected || connecting || (await executeConnection())}
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
        </Button>
      )}
    </Flex>
  )
}
