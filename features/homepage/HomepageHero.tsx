import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { HomePageBanner } from 'components/HomePageBanner'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { Trans, useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'

import { Hero } from './common/Hero'
import { HomepagePromoBlock } from './common/HomepagePromoBlock'
import { OasisStats } from './OasisStats'

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: [3, 1, 1] }}>
      <Text variant="managedVolumeValue" sx={{ textAlign: 'center' }}>
        {value}
      </Text>
      <Text
        variant="paragraph2"
        sx={{ textAlign: 'center', fontWeight: 'semiBold', color: 'neutral80' }}
      >
        {label}
      </Text>
    </Box>
  )
}

function ManagedVolumeStats({ oasisStatsValue }: { oasisStatsValue?: OasisStats }) {
  const { t } = useTranslation()
  return (
    <HomepagePromoBlock.Big
      background="rgba(255, 255, 255, 0.5)"
      height="auto"
      sx={{ mt: 3, py: '50px', mb: [3, 5], border: '1px solid', borderColor: 'neutral10' }}
    >
      <Grid columns={['1fr', '1fr 1fr 1fr']}>
        <StatCell
          label={t('landing.stats.30-day-volume')}
          value={
            oasisStatsValue
              ? `$${formatAsShorthandNumbers(new BigNumber(oasisStatsValue.monthlyVolume), 2)}`
              : '-'
          }
        />
        <StatCell
          label={t('landing.stats.managed-on-oasis')}
          value={
            oasisStatsValue
              ? `$${formatAsShorthandNumbers(new BigNumber(oasisStatsValue.managedOnOasis), 2)}`
              : '-'
          }
        />
        <StatCell
          label={t('landing.stats.median-vault')}
          value={
            oasisStatsValue
              ? `$${formatAsShorthandNumbers(new BigNumber(oasisStatsValue.medianVaultSize), 2)}`
              : '-'
          }
        />
      </Grid>
    </HomepagePromoBlock.Big>
  )
}

export const HomepageHero = () => {
  const router = useRouter()
  const { context$, checkReferralLocal$, userReferral$, getOasisStats$ } = useAppContext()
  const [oasisStatsValue] = useObservable(getOasisStats$())
  const [context] = useObservable(context$)
  const [userReferral] = useObservable(userReferral$)
  const [checkReferralLocal] = useObservable(checkReferralLocal$)
  const { t } = useTranslation()

  useEffect(() => {
    if (!localReferral && referralsEnabled) {
      const linkReferral = router.query.ref as string
      if (linkReferral) {
        setLocalReferral(linkReferral)
        setLandedWithRef(linkReferral)
      }
    }
  }, [checkReferralLocal, router.isReady])

  const referralsEnabled = useFeatureToggle('Referrals')
  const notificationsEnabled = useFeatureToggle('Notifications')
  const [landedWithRef, setLandedWithRef] = useState('')
  const [localReferral, setLocalReferral] = useLocalStorage('referral', '')
  return (
    <>
      {referralsEnabled && landedWithRef && context?.status === 'connectedReadonly' && (
        <NewReferralModal />
      )}
      {(referralsEnabled || notificationsEnabled) && <TermsOfService userReferral={userReferral} />}
      <Flex
        sx={{
          height: 'auto',
          flexDirection: 'column',
        }}
      >
        <Flex
          sx={{
            justifyContent: 'center',
            mt: '20px',
            mb: -3,
            width: 'unset',
          }}
        >
          <HomePageBanner
            heading={t('dsr.landing-page-banner.title')}
            link={EXTERNAL_LINKS.BLOG.DSR_RATE_HIKE}
            icon={{ name: 'dai_circle_color', background: '#FFEBC4' }}
          />
        </Flex>
        <Hero
          isConnected={context?.status === 'connected'}
          heading="landing.hero.main.headline"
          subheading={<Trans i18nKey="landing.hero.main.subheader" components={[<br />]} />}
        />
        <ManagedVolumeStats oasisStatsValue={oasisStatsValue} />
      </Flex>
    </>
  )
}
