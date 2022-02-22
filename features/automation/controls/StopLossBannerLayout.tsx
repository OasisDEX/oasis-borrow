import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Button, Card, Flex, Grid, Image, Text } from 'theme-ui'

import { AfterPillProps, VaultDetailsAfterPill } from '../../../components/vault/VaultDetails'
import { WithArrow } from '../../../components/WithArrow'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'

interface StopLossBannerSectionProps {
  text: ReactNode
  value: ReactNode
  afterValue?: ReactNode
}

function StopLossBannerSection({
  text,
  value,
  afterValue,
  showAfterPill,
}: StopLossBannerSectionProps & AfterPillProps) {
  return (
    <Flex sx={{ flexDirection: 'column', alignItems: ['center', 'flex-start'] }}>
      <Text variant="paragraph4" sx={{ fontWeight: 'semiBold', mb: 2, color: 'lavender' }}>
        {text}
      </Text>
      <Text variant="header3" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
      {afterValue && showAfterPill && (
        <VaultDetailsAfterPill afterPillColors={{ bg: 'dimSuccess', color: 'onSuccess' }}>
          {afterValue} after
        </VaultDetailsAfterPill>
      )}
    </Flex>
  )
}

interface StopLossBannerLayoutProps {
  dynamicStopPrice: BigNumber
  afterDynamicStopPrice: BigNumber
  stopLossLevel: BigNumber
  handleClick: () => void
}

export function StopLossBannerLayout({
  dynamicStopPrice,
  afterDynamicStopPrice,
  stopLossLevel,
  handleClick,
  showAfterPill,
}: StopLossBannerLayoutProps & AfterPillProps) {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        background: 'linear-gradient(92.87deg, #F0FCFF 13.82%, #FFEFFA 88.81%), #FFFFFF',
        // borderImageSource: 'linear-gradient(92.87deg, #B8E0E9 13.82%, #FDDBF2 22.8%)', // doesnt work
        mb: 3,
        py: '24px',
        height: ['auto', '132px'],
      }}
    >
      <Grid columns={[1, '90px 1fr 1fr 1fr']} sx={{ height: '100%' }}>
        <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image src={staticFilesRuntimeUrl('/static/img/protection.svg')} />
        </Flex>
        <StopLossBannerSection
          text={t('protection.dynamic-stop-loss-price')}
          value={`$${formatAmount(dynamicStopPrice, 'USD')}`}
          afterValue={`$${formatAmount(afterDynamicStopPrice, 'USD')}`}
          showAfterPill={showAfterPill}
        />
        <StopLossBannerSection
          text={t('protection.stop-loss-coll-ratio')}
          value={formatPercent(stopLossLevel.times(100), { precision: 2 })}
        />
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: ['center', 'flex-start'],
          }}
        >
          <Button variant="unStyled" onClick={handleClick} sx={{ p: 0 }}>
            <WithArrow sx={{ color: 'link' }}>
              <Text
                sx={{ display: 'inline', color: 'link', fontSize: 1, fontWeight: 'semiBold' }}
                variant="paragraph1"
              >
                {t('protection.edit-vault-protection')}
              </Text>
            </WithArrow>
          </Button>
        </Flex>
      </Grid>
    </Card>
  )
}
