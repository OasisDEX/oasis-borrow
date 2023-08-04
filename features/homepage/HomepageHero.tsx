import BigNumber from 'bignumber.js'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { tosContext, TOSContextProvider } from 'components/context/TOSContextProvider'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { checkReferralLocalStorage } from 'features/referralOverview/referralLocal'
import TermsOfServiceReferral from 'features/termsOfService/TermsOfServiceReferral'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { Trans, useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Box, Container, Flex, Grid, Text } from 'theme-ui'

import { Hero } from './common/Hero'
import { HomepagePromoBlock } from './common/HomepagePromoBlock'
import { OasisStats } from './OasisStats'
import { useOasisStats } from './stats'

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

function ManagedVolumeStats({ oasisStats }: { oasisStats?: OasisStats }) {
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
            oasisStats
              ? `$${formatAsShorthandNumbers(new BigNumber(oasisStats.monthlyVolume), 2)}`
              : '-'
          }
        />
        <StatCell
          label={t('landing.stats.managed-on-oasis')}
          value={
            oasisStats
              ? `$${formatAsShorthandNumbers(new BigNumber(oasisStats.managedOnOasis), 2)}`
              : '-'
          }
        />
        <StatCell
          label={t('landing.stats.collateral-automated')}
          value={
            oasisStats
              ? `$${formatAsShorthandNumbers(
                  new BigNumber(oasisStats.lockedCollateralActiveTrigger),
                  2,
                )}`
              : '-'
          }
        />
      </Grid>
    </HomepagePromoBlock.Big>
  )
}

export const HomepageHero = () => {
  const router = useRouter()
  const { data: oasisStats } = useOasisStats()
  const { isConnected } = useAccount()
  const referralLocal = checkReferralLocalStorage()

  useEffect(() => {
    if (!localReferral && referralsEnabled) {
      const linkReferral = router.query.ref as string
      if (linkReferral) {
        setLocalReferral(linkReferral)
        setLandedWithRef(linkReferral)
      }
    }
  }, [referralLocal, router.isReady])

  const referralsEnabled = useFeatureToggle('Referrals')
  const notificationsEnabled = useFeatureToggle('Notifications')
  const [landedWithRef, setLandedWithRef] = useState('')
  const [localReferral, setLocalReferral] = useLocalStorage('referral', '')
  return (
    <Container>
      {referralsEnabled && landedWithRef && <NewReferralModal />}
      {(referralsEnabled || notificationsEnabled) && (
        <TOSContextProvider>
          <DeferedContextProvider context={tosContext}>
            <TermsOfServiceReferral />
          </DeferedContextProvider>
        </TOSContextProvider>
      )}
      <Flex
        sx={{
          height: 'auto',
          flexDirection: 'column',
        }}
      >
        <Hero
          isConnected={isConnected}
          heading="landing.hero.main.headline"
          subheading={<Trans i18nKey="landing.hero.main.subheader" components={[<br />]} />}
        />
        <ManagedVolumeStats oasisStats={oasisStats} />
      </Flex>
    </Container>
  )
}
