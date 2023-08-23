import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Container, Flex, Grid, Text } from 'theme-ui'

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
          label={t('landing.stats.collateral-automated')}
          value={
            oasisStatsValue
              ? `$${formatAsShorthandNumbers(
                  new BigNumber(oasisStatsValue.lockedCollateralActiveTrigger),
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
  const { context$, getOasisStats$ } = useAppContext()
  const [oasisStatsValue] = useObservable(getOasisStats$())
  const [context] = useObservable(context$)
  return (
    <Container>
      <Flex
        sx={{
          height: 'auto',
          flexDirection: 'column',
        }}
      >
        <Hero
          isConnected={context?.status === 'connected'}
          heading="landing.hero.main.headline"
          subheading={<Trans i18nKey="landing.hero.main.subheader" components={[<br />]} />}
        />
        <ManagedVolumeStats oasisStatsValue={oasisStatsValue} />
      </Flex>
    </Container>
  )
}
