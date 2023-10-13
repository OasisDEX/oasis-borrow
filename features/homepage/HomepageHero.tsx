import BigNumber from 'bignumber.js'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Container, Flex, Grid, Text } from 'theme-ui'

import { Hero } from './common/Hero'
import { HomepagePromoBlock } from './common/HomepagePromoBlock'
import type { OasisStats } from './OasisStats'
import { useOasisStats } from './stats'

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <Flex sx={{ my: ['30px', 0], flexDirection: 'column' }}>
      <Text variant="managedVolumeValue" sx={{ textAlign: 'center' }}>
        {value}
      </Text>
      <Text
        variant="paragraph2"
        sx={{ textAlign: 'center', fontWeight: 'semiBold', color: 'neutral80' }}
      >
        {label}
      </Text>
    </Flex>
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
  const { data: oasisStats } = useOasisStats()
  const { isConnected } = useAccount()
  return (
    <Container>
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
